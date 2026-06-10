export class AiRateLimitExceededException extends Error {
  constructor(
    public readonly retryAfterMs: number,
    public readonly provider: string,
    public readonly modelAlias: string,
  ) {
    super(
      `Rate limit exceeded for provider '${provider}' and model alias '${modelAlias}'. Retry after ${retryAfterMs}ms`,
    );
    this.name = 'AiRateLimitExceededException';
  }
}