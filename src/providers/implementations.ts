import "server-only";
import { LLMProvider, ProviderError, ProviderResponse } from "./types";
import {
  getActiveKey,
  reportKeyFailure,
  reportKeySuccess,
  hasAnyKey,
} from "./keyManager";

/**
 * Deterministic offline fallback so the pipeline always produces a usable
 * research document even when no provider API keys are configured.
 */
export function mockGenerate(
  providerName: string,
  prompt: string,
): ProviderResponse {
  const topic = prompt.split("\n").pop()?.trim() || prompt;
  return {
    provider: providerName,
    model: "mock",
    text: `### ${providerName} findings\n\nNo live API key configured for ${providerName}, so this is placeholder research on "${topic}". Configure ${providerName.toUpperCase()}_KEY_1 to get real results.\n`,
  };
}

async function withKeyRotation(
  providerName: string,
  call: (key: string) => Promise<ProviderResponse>,
  fallback: ProviderResponse,
): Promise<ProviderResponse> {
  if (!hasAnyKey(providerName)) return fallback;

  const attempts = 3;
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    const key = getActiveKey(providerName);
    if (!key) break;
    try {
      const result = await call(key);
      reportKeySuccess(providerName, key);
      return result;
    } catch (err) {
      lastError = err;
      reportKeyFailure(providerName, key);
    }
  }
  console.error(`[providers] ${providerName} exhausted retries`, lastError);
  return fallback;
}

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";

  async generate(prompt: string): Promise<ProviderResponse> {
    return withKeyRotation(
      "GEMINI",
      async (key) => {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Header auth (not a query string) so the key never ends up in
              // server/proxy access logs or Referer headers.
              "x-goog-api-key": key,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              // Grounds responses with live Google Search results.
              tools: [{ google_search: {} }],
            }),
          },
        );
        if (!res.ok)
          throw new ProviderError(
            `Gemini HTTP ${res.status}`,
            "gemini",
            res.status === 429 || res.status >= 500,
          );
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const usage = data?.usageMetadata
          ? {
              promptTokens: data.usageMetadata.promptTokenCount,
              completionTokens: data.usageMetadata.candidatesTokenCount,
            }
          : undefined;
        return { provider: "gemini", model: "gemini-2.5-flash", text, usage };
      },
      mockGenerate("gemini", prompt),
    );
  }
}

const NEMOTRON_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

/**
 * NVIDIA Nemotron (via OpenRouter's OpenAI-compatible chat completions API).
 * Reasoning is enabled per OpenRouter's `reasoning` field; the final answer
 * lives in `message.content` while `message.reasoning_details` (if present)
 * holds the model's intermediate reasoning trace, which we intentionally
 * don't surface in the research document.
 */
export class NemotronProvider implements LLMProvider {
  readonly name = "nemotron";

  async generate(prompt: string): Promise<ProviderResponse> {
    return withKeyRotation(
      "OPENROUTER",
      async (key) => {
        const res = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: NEMOTRON_MODEL,
              messages: [{ role: "user", content: prompt }],
              reasoning: { enabled: true },
            }),
          },
        );
        if (!res.ok)
          throw new ProviderError(
            `Nemotron HTTP ${res.status}`,
            "nemotron",
            res.status === 429 || res.status >= 500,
          );
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content ?? "";
        const usage = data?.usage
          ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
          : undefined;
        return { provider: "nemotron", model: NEMOTRON_MODEL, text, usage };
      },
      mockGenerate("nemotron", prompt),
    );
  }
}