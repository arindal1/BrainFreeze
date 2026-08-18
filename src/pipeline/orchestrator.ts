import "server-only";
import { agents } from "./agents";
import { createProvider } from "@/providers/providerFactory";
import { aggregateToMarkdown } from "@/aggregator/aggregator";
import { jobsRepository, resultsRepository, providerLogsRepository } from "@/repositories/researchRepository";
import { jobEventBus } from "./eventBus";

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
      const provider = createProvider(agent.provider);
      const start = Date.now();
      try {
        const response = await provider.generate(agent.buildPrompt(job.query));
        await providerLogsRepository.log(jobId, agent.provider, agent.id, true, Date.now() - start);
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
}