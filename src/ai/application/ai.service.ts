import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AI_SDK_CLIENT, AI_MODEL_REGISTRY, AI_RATE_LIMITER } from './ai.tokens';
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
} from '../ai.types';
import {
  AiPrompt,
  AiResponse,
  AiMessage,
  AiUsage,
  type AiPromptProps,
  type AiMessageProps,
} from '../domain';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_SDK_CLIENT) private readonly sdkClient: AiSdkClient,
    @Inject(AI_MODEL_REGISTRY)
    private readonly modelRegistry: ModelRegistryService,
    @Inject(AI_RATE_LIMITER) private readonly rateLimiter: AiRateLimiterService,
  ) {}

  onModuleInit() {
    this.modelRegistry.registerDefaultModels();
    this.logger.log('AiService inicializado');
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
    const { provider, model, modelAlias } = this.resolveConfig(input);

    this.rateLimiter.checkLimit(provider, modelAlias);

    const prompt = input.systemPrompt
      ? AiPrompt.create({
          userPrompt: input.prompt,
          systemPrompt: input.systemPrompt,
        })
      : AiPrompt.fromSingle(input.prompt);

    const sdkMessages = prompt.toMessages();

    const result = await this.sdkClient.generateText({
      prompt: input.prompt,
      model,
      provider,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
      systemPrompt: input.systemPrompt,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);

    return result;
  }

  async generateTextWithPrompt(prompt: AiPrompt): Promise<AiResponse> {
    const provider = this.modelRegistry.getDefaultProvider();
    const model = this.modelRegistry.getModelForAlias(
      this.modelRegistry.getDefaultModelAlias(),
    );
    const modelAlias = this.modelRegistry.getDefaultModelAlias();

    this.rateLimiter.checkLimit(provider, modelAlias);

    const sdkMessages = prompt.toMessages();
    const lastMessage = sdkMessages[sdkMessages.length - 1];

    const result = await this.sdkClient.generateText({
      prompt: lastMessage.content,
      model,
      provider,
      systemPrompt: prompt.hasSystemPrompt
        ? sdkMessages.find((m) => m.role === 'system')?.content
        : undefined,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);

    const usage = AiUsage.fromSdk(result.usage);
    return AiResponse.create({
      text: result.text,
      usage: usage.toJSON(),
      model,
      provider,
    }).withUsage(usage);
  }

  async generateObject<TResult>(
    input: GenerateObjectInput<TResult>,
  ): Promise<GenerateObjectOutput<TResult>> {
    const { provider, model, modelAlias } = this.resolveConfig(input);

    this.rateLimiter.checkLimit(provider, modelAlias);

    const result = await this.sdkClient.generateObject<TResult>({
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

  async streamObject<TResult>(
    input: StreamObjectInput<TResult>,
  ): Promise<void> {
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

    const messages = input.messages.map((m) =>
      AiMessage.create({ role: m.role as any, content: m.content }),
    );

    const result = await this.sdkClient.chat({
      ...input,
      provider,
      model,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);

    return result;
  }

  async chatWithMessages(messages: AiMessage[]): Promise<AiResponse> {
    const provider = this.modelRegistry.getDefaultProvider();
    const model = this.modelRegistry.getModelForAlias(
      this.modelRegistry.getDefaultModelAlias(),
    );
    const modelAlias = this.modelRegistry.getDefaultModelAlias();

    this.rateLimiter.checkLimit(provider, modelAlias);

    const sdkMessages = messages.map((m) => m.toSdkFormat());

    const result = await this.sdkClient.chat({
      messages: sdkMessages,
      model,
      provider,
    });

    this.rateLimiter.recordRequest(provider, modelAlias);

    const usage = AiUsage.fromSdk(result.usage);
    return AiResponse.create({
      text: result.text,
      usage: usage.toJSON(),
      model,
      provider,
    }).withUsage(usage);
  }

  private resolveConfig(input: {
    provider?: string;
    model?: string;
    modelAlias?: string;
  }): { provider: string; model: string; modelAlias: string } {
    return {
      provider: input.provider ?? this.modelRegistry.getDefaultProvider(),
      model:
        input.model ??
        this.modelRegistry.getModelForAlias(input.modelAlias as any),
      modelAlias: input.modelAlias ?? this.modelRegistry.getDefaultModelAlias(),
    };
  }
}
