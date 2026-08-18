import { LLMProvider } from "./types";
import { GeminiProvider, NemotronProvider, GrokProvider } from "./implementations";

export type ProviderName = "gemini" | "nemotron" | "grok";

/** Factory pattern: create the requested provider dynamically by name. */
export function createProvider(name: ProviderName): LLMProvider {
  switch (name) {
    case "gemini":
      return new GeminiProvider();
    case "nemotron":
      return new NemotronProvider();
    case "grok":
      return new GrokProvider();
    default: {
      const exhaustive: never = name;
      throw new Error(`Unknown provider: ${exhaustive}`);
    }
  }
}