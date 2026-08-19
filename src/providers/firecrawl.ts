import "server-only";

/**
 * Firecrawl page scrape, used to ground the "current developments" agent
 * when the user's query is itself a URL. No API key is required to get
 * started; FIRECRAWL_KEY (if set) is sent for higher rate limits.
 * Returns markdown content, or "" if the request fails.
 */
export async function firecrawlScrape(url: string): Promise<string> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const key = process.env.FIRECRAWL_KEY;
    if (key) headers.Authorization = `Bearer ${key}`;

    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers,
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    if (!res.ok) throw new Error(`Firecrawl HTTP ${res.status}`);

    const data = await res.json();
    const markdown: string | undefined = data?.data?.markdown;
    return markdown ?? "";
  } catch (err) {
    console.error("[providers] firecrawl scrape failed", err);
    return "";
  }
}