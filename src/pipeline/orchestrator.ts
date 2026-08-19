import "server-only";
import { agents } from "./agents";
import { createProvider } from "@/providers/providerFactory";
import { tavilySearch } from "@/providers/tavily";
import { firecrawlScrape } from "@/providers/firecrawl";
import { isUrl } from "@/lib/normalize";
import { aggregateToMarkdown } from "@/aggregator/aggregator";
import { jobsRepository, resultsRepository, providerLogsRepository } from "@/repositories/researchRepository";
import { jobEventBus } from "./eventBus";
import { sendPushToUser } from "@/lib/push";

/**
 * The "current developments" agent (agent-c) is not LLM-backed: its section
 * is the raw Tavily web search results, plus a Firecrawl page scrape when
 * the query is itself a URL, returned directly with no summarization.
 */
async function buildSearchSection(query: string): Promise<string> {
  const parts: string[] = [];

  const searchResults = await tavilySearch(query);
  if (searchResults) parts.push(`### Web search results (Tavily)\n${searchResults}`);

  if (isUrl(query)) {
    const scraped = await firecrawlScrape(query.trim());
    if (scraped) parts.push(`### Scraped page content (Firecrawl)\n${scraped.slice(0, 8000)}`);
  }

  if (parts.length === 0) return "No live search results were available for this query.";
  return parts.join("\n\n");
}

/**
 * Pipeline pattern: each stage is independently composable.
 * Normalize -> (queued upstream) -> run agents -> merge -> save -> notify.
 */
export async function runResearchPipeline(jobId: string, userId: string) {
  const job = await jobsRepository.findById(jobId);
  if (!job || job.status === "CANCELLED") return;

  const startedAt = new Date();
  await jobsRepository.updateStatus(jobId, "PROCESSING", { progress: 5, statusMessage: "Starting agents", startedAt });
  jobEventBus.publish(userId, { jobId, type: "progress", progress: 5, message: "Starting agents" });

  const results = await Promise.allSettled(
    agents.map(async (agent) => {
      const start = Date.now();

      if (agent.provider === "search") {
        try {
          const text = await buildSearchSection(job.query);
          await providerLogsRepository.log(jobId, "search", agent.id, true, Date.now() - start);
          return { label: agent.label, text };
        } catch (err) {
          await providerLogsRepository.log(
            jobId,
            "search",
            agent.id,
            false,
            Date.now() - start,
            err instanceof Error ? err.message : "Unknown error",
          );
          throw err;
        }
      }

      const provider = createProvider(agent.provider);
      try {
        const prompt = agent.buildPrompt!(job.query);
        const response = await provider.generate(prompt);
        await providerLogsRepository.log(
          jobId,
          agent.provider,
          agent.id,
          true,
          Date.now() - start,
          undefined,
          response.usage,
        );
        return { label: agent.label, text: response.text };
      } catch (err) {
        await providerLogsRepository.log(
          jobId,
          agent.provider,
          agent.id,
          false,
          Date.now() - start,
          err instanceof Error ? err.message : "Unknown error",
        );
        throw err;
      }
    }),
  );

  await jobsRepository.updateStatus(jobId, "PROCESSING", { progress: 70, statusMessage: "Aggregating results" });
  jobEventBus.publish(userId, { jobId, type: "progress", progress: 70, message: "Aggregating results" });

  const sections = results
    .filter((r): r is PromiseFulfilledResult<{ label: string; text: string }> => r.status === "fulfilled")
    .map((r) => r.value);

  if (sections.length === 0) {
    await jobsRepository.updateStatus(jobId, "FAILED", {
      error: "All research agents failed",
      completedAt: new Date(),
    });
    jobEventBus.publish(userId, { jobId, type: "failed", message: "All research agents failed" });
    void sendPushToUser(userId, {
      jobId,
      title: "Research failed",
      body: job.query.length > 90 ? `${job.query.slice(0, 87)}...` : job.query,
    });
    return;
  }

  // Re-check for cancellation: the user may have cancelled while agents were running.
  const latest = await jobsRepository.findById(jobId);
  if (!latest || latest.status === "CANCELLED") return;

  const markdown = aggregateToMarkdown(job.query, sections);
  const durationMs = Date.now() - startedAt.getTime();

  await resultsRepository.save(jobId, job.query, markdown, durationMs);
  await jobsRepository.updateStatus(jobId, "COMPLETED", {
    progress: 100,
    statusMessage: "Completed",
    completedAt: new Date(),
  });

  jobEventBus.publish(userId, { jobId, type: "completed", progress: 100, message: "Research complete" });
  void sendPushToUser(userId, {
    jobId,
    title: "Research ready",
    body: job.query.length > 90 ? `${job.query.slice(0, 87)}...` : job.query,
  });
}