import { DEFAULT_MODELS, type ModelAlias } from '../../ai.types';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface AiRateLimitConfig {
  provider: Record<string, RateLimitConfig>;
  modelAlias: Record<string, RateLimitConfig>;
}

export class AiConfig {
  private constructor(
    public readonly apiKeys: Record<string, string>,
    public readonly defaultProvider: string,
    public readonly defaultModel: string,
    public readonly defaultModelAlias: ModelAlias,
    public readonly rateLimits: AiRateLimitConfig,
  ) {}

  static fromEnv(overrides: Partial<AiConfig> = {}): AiConfig {
    const apiKeys: Record<string, string> = {
      openrouter: process.env.OPENROUTER_API_KEY ?? '',
      openai: process.env.OPENAI_API_KEY ?? '',
      anthropic: process.env.ANTHROPIC_API_KEY ?? '',
      groq: process.env.GROQ_API_KEY ?? '',
      mistral: process.env.MISTRAL_API_KEY ?? '',
      perplexity: process.env.PERPLEXITY_API_KEY ?? '',
      ...overrides.apiKeys,
    };

    const defaultProvider =
      process.env.AI_DEFAULT_PROVIDER ??
      overrides.defaultProvider ??
      'openrouter';

    const defaultModel =
      process.env.AI_DEFAULT_MODEL ?? overrides.defaultModel ?? DEFAULT_MODELS.reasoning;

    const defaultModelAlias: ModelAlias =
      (process.env.AI_DEFAULT_MODEL_ALIAS as ModelAlias) ??
      overrides.defaultModelAlias ??
      'reasoning';

    const rateLimits: AiRateLimitConfig = overrides.rateLimits ?? {
      provider: {
        openrouter: { maxRequests: 60, windowMs: 60_000 },
        openai: { maxRequests: 120, windowMs: 60_000 },
        groq: { maxRequests: 30, windowMs: 60_000 },
        mistral: { maxRequests: 30, windowMs: 60_000 },
        perplexity: { maxRequests: 60, windowMs: 60_000 },
      },
      modelAlias: {
        reasoning: { maxRequests: 10, windowMs: 60_000 },
        fast: { maxRequests: 60, windowMs: 60_000 },
      },
    };

    return new AiConfig(
      apiKeys,
      defaultProvider,
      defaultModel,
      defaultModelAlias,
      rateLimits,
    );
  }

  getApiKey(provider: string): string {
    return this.apiKeys[provider] ?? '';
  }

  getModelForAlias(alias: ModelAlias): string {
    return DEFAULT_MODELS[alias] ?? this.defaultModel;
  }

  getRateLimitForProvider(provider: string): RateLimitConfig | undefined {
    return this.rateLimits.provider[provider];
  }

  getRateLimitForModelAlias(alias: string): RateLimitConfig | undefined {
    return this.rateLimits.modelAlias[alias];
  }
}