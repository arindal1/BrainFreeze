/**
 * Approximate public list pricing per 1K tokens, used only to produce a
 * rough cost *estimate* on the usage dashboard - not exact billing data.
 * Nemotron currently runs on OpenRouter's free-tier (`:free`) model variant,
 * so its cost is $0 regardless of token volume.
 */
const PRICE_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  gemini: { input: 0.0003, output: 0.0025 },
  nemotron: { input: 0, output: 0 },
};

export function estimateCostUsd(provider: string, promptTokens: number, completionTokens: number): number {
  const price = PRICE_PER_1K_TOKENS[provider];
  if (!price) return 0;
  return (promptTokens / 1000) * price.input + (completionTokens / 1000) * price.output;
}