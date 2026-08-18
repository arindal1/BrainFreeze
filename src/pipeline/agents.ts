export type AgentId = "agent-a" | "agent-b" | "agent-c";

interface AgentDefinition {
  id: AgentId;
  label: string;
  provider: "gemini" | "nemotron" | "grok";
  buildPrompt: (topic: string) => string;
}

/**
 * Shared instructions so every agent generalizes across any kind of search
 * subject - a topic, technology, product, company, sector, person, or event -
 * instead of assuming the query is always an abstract "topic".
 */
const SUBJECT_GUIDANCE =
  "The subject may be a concept, technology, product, service, company, organization, industry/sector, person, event, or place. " +
  "Identify what kind of subject it is first, then tailor the depth and structure of your research to that kind " +
  "(e.g. a company needs business model/financials/competitors; a product needs specs/pricing/reviews; a technology needs " +
  "architecture/use cases; a sector needs market size/key players/trends; a person needs background/notable work; an event " +
  "needs timeline/impact). Do not force an irrelevant structure onto a subject it doesn't fit.";

/** Each agent independently researches one facet of the subject in parallel. */
export const agents: AgentDefinition[] = [
  {
    id: "agent-a",
    label: "Broad Factual Research",
    provider: "nemotron",
    buildPrompt: (topic) =>
      `You are a meticulous research assistant producing a broad factual overview for a research document. ${SUBJECT_GUIDANCE}\n\n` +
      `Cover: a clear definition/introduction of the subject, key facts and background, the most important related concepts or entities, ` +
      `and how it fits into its broader context or category. Be precise, avoid speculation, and note where information may be uncertain or disputed. ` +
      `Format the response as markdown with clear "##" headings and bullet points where useful. Do not include a top-level title heading.\n\n` +
      `Subject: ${topic}`,
  },
  {
    id: "agent-b",
    label: "Technical Deep Dive",
    provider: "gemini",
    buildPrompt: (topic) =>
      `You are a research assistant with access to current web search, producing a technical/analytical deep dive for a research document. ${SUBJECT_GUIDANCE}\n\n` +
      `Cover: how it works or is built (architecture, mechanism, methodology, business model, or process, as applicable), key features/specifications ` +
      `or capabilities, strengths and weaknesses (pros/cons), and a comparison to the closest alternatives or competitors. Use up-to-date, verifiable ` +
      `information from your search results and cite notable sources inline as plain text (e.g. "(Source: example.com)") where relevant. ` +
      `Format the response as markdown with clear "##" headings and bullet points where useful. Do not include a top-level title heading.\n\n` +
      `Subject: ${topic}`,
  },
  {
    id: "agent-c",
    label: "Current Developments",
    provider: "grok",
    buildPrompt: (topic) =>
      `You are a research assistant with access to real-time web search, producing a "current developments" section for a research document. ${SUBJECT_GUIDANCE}\n\n` +
      `Cover: the latest news, releases, updates, or events; recent trends and trajectory; relevant market data, funding, pricing, or performance ` +
      `figures if applicable; and public/community sentiment or expert opinion. Prioritize recency and clearly flag the approximate timeframe of any ` +
      `information you cite. Format the response as markdown with clear "##" headings and bullet points where useful. Do not include a top-level title heading.\n\n` +
      `Subject: ${topic}`,
  },
];