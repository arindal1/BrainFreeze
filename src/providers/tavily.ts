import "server-only";
import { getActiveKey, reportKeyFailure, reportKeySuccess, hasAnyKey } from "./keyManager";

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
}

/**
 * Tavily web search, used to ground the "current developments" agent.
 * Returns a markdown bullet list of results, or "" if no key is configured
 * or the request fails (callers should treat this as optional context).
 */
export async function tavilySearch(query: string): Promise<string> {
  if (!hasAnyKey("TAVILY")) return "";
  const key = getActiveKey("TAVILY");
  if (!key) return "";

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query, max_results: 5 }),
    });
    if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);

    const data = await res.json();
    reportKeySuccess("TAVILY", key);

    const results: TavilyResult[] = data?.results ?? [];
    if (results.length === 0) return "";
    return results
      .map((r) => `- **${r.title ?? r.url}** (${r.url}): ${r.content ?? ""}`)
      .join("\n");
  } catch (err) {
    reportKeyFailure("TAVILY", key);
    console.error("[providers] tavily search failed", err);
    return "";
  }
}