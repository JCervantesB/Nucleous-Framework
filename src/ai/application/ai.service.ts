import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AI_SDK_CLIENT,
  AI_MODEL_REGISTRY,
  AI_RATE_LIMITER,
  AI_SERVICE,
} from './ai.tokens';
import { AiSdkClient } from '../infrastructure/clients/ai-sdk.client';
import { ModelRegistryService } from '../infrastructure/clients/model-registry.service';
import { AiRateLimiterService } from '../infrastructure/rate-limit/ai-rate-limiter.service';
import type {
  GenerateTextInput,
  GenerateTextOutput,
  GenerateObjectInput,
  GenerateObjectOutput,
  StreamTextInput,
  StreamObjectInput,
  ChatInput,
  ChatOutput,
  AiUsage,
} from '../ai.types';

@Injectable()
export class AiService implements OnModuleInit {
  constructor(
    @Inject(AI_SDK_CLIENT) private readonly sdkClient: AiSdkClient,
    @Inject(AI_MODEL_REGISTRY) private readonly modelRegistry: ModelRegistryService,
    @Inject(AI_RATE_LIMITER) private readonly rateLimiter: AiRateLimiterService,
  ) {}

  onModuleInit() {
    this.modelRegistry.registerDefaultModels();
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
    const { provider, model, modelAlias } = this.resolveConfig(input);

    this.rateLimiter.checkLimit(provider, modelAlias);

    const result = await this.sdkClient.generateText({
      ...input,
      provider,
      model,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);

    return result;
  }

  async generateObject<T>(
    input: GenerateObjectInput<T>,
  ): Promise<GenerateObjectOutput<T>> {
    const { provider, model, modelAlias } = this.resolveConfig(input);

    this.rateLimiter.checkLimit(provider, modelAlias);

    const result = await this.sdkClient.generateObject<T>({
      ...input,
      provider,
      model,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);

    return result;
  }

  async streamText(input: StreamTextInput): Promise<void> {
    const { provider, model, modelAlias } = this.resolveConfig(input);

    this.rateLimiter.checkLimit(provider, modelAlias);

    await this.sdkClient.streamText({
      ...input,
      provider,
      model,
      onChunk: input.onChunk,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);
  }

  async streamObject<T>(input: StreamObjectInput<T>): Promise<void> {
    const { provider, model, modelAlias } = this.resolveConfig(input);

    this.rateLimiter.checkLimit(provider, modelAlias);

    await this.sdkClient.streamObject({
      ...input,
      provider,
      model,
      onChunk: input.onChunk,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);
  }

  async chat(input: ChatInput): Promise<ChatOutput> {
    const { provider, model, modelAlias } = this.resolveConfig(input);

    this.rateLimiter.checkLimit(provider, modelAlias);

    const result = await this.sdkClient.chat({
      ...input,
      provider,
      model,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);

    return result;
  }

  private resolveConfig(input: {
    provider?: string;
    model?: string;
    modelAlias?: string;
  }): { provider: string; model: string; modelAlias: string } {
    return {
      provider: input.provider ?? this.modelRegistry.getDefaultProvider(),
      model: input.model ?? this.modelRegistry.getModelForAlias(input.modelAlias as any),
      modelAlias: input.modelAlias ?? this.modelRegistry.getDefaultModelAlias(),
    };
  }
}