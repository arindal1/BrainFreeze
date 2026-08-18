export interface ProviderResponse {
  text: string;
  provider: string;
  model?: string;
}

/**
 * Strategy pattern contract. Every LLM vendor integration implements this
 * exact shape so the pipeline never depends on a concrete provider.
 */
export interface LLMProvider {
  readonly name: string;
  generate(prompt: string): Promise<ProviderResponse>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}