import { Injectable, Inject, Logger } from '@nestjs/common';
import { AI_CONFIG } from '../../application/ai.tokens';
import { AiConfig } from '../config/ai.config';
import { createOpenAI } from '@ai-sdk/openai';
import { createGateway } from '@ai-sdk/gateway';
import type {
  GenerateTextInput,
  GenerateTextOutput,
  GenerateObjectInput,
  GenerateObjectOutput,
  StreamTextInput,
  StreamObjectInput,
  ChatInput,
  ChatOutput,
} from '../../ai.types';
import { AiMessage, AiUsage, AiResponse } from '../../domain';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface ProviderEntry {
  provider: any;
  modelPrefix: string;
}

@Injectable()
export class AiSdkClient {
  private readonly logger = new Logger(AiSdkClient.name);
  private readonly providers: Map<string, ProviderEntry> = new Map();

  constructor(@Inject(AI_CONFIG) private readonly config: AiConfig) {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.providers.set('openrouter', {
      provider: createOpenAI({
        baseURL: OPENROUTER_BASE_URL,
        apiKey: this.config.getApiKey('openrouter'),
      }),
      modelPrefix: '',
    });

    this.providers.set('openai', {
      provider: createOpenAI({
        apiKey: this.config.getApiKey('openai'),
      }),
      modelPrefix: '',
    });

    const gatewayProvider = createGateway({
      apiKey: this.config.getApiKey('gateway') ?? process.env.AI_GATEWAY_API_KEY ?? '',
    });
    this.providers.set('gateway', {
      provider: gatewayProvider,
      modelPrefix: '',
    });
  }

  private getProviderEntry(provider: string): ProviderEntry | undefined {
    return this.providers.get(provider);
  }

  async generateText(input: {
    prompt: string;
    model: string;
    provider: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<GenerateTextOutput> {
    const entry = this.getProviderEntry(input.provider);
    if (!entry) {
      throw new Error(`Provider ${input.provider} no soportado`);
    }

    const model = entry.provider.languageModel(input.model);
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    if (input.systemPrompt) {
      messages.push({ role: 'system', content: input.systemPrompt });
    }
    messages.push({ role: 'user', content: input.prompt });

    const response = await model.doGenerate({
      mode: { type: 'generate-text' },
      messages,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    const text = response.finishReason === 'stop' ? response.text : '';
    const usage = AiUsage.fromSdk({
      promptTokens: response.usage?.promptTokens ?? 0,
      completionTokens: response.usage?.completionTokens ?? 0,
      totalTokens: response.usage?.totalTokens ?? 0,
    });

    return {
      text,
      usage: usage.toJSON(),
      model: input.model,
      provider: input.provider,
    };
  }

  async generateObject<T>(input: {
    prompt: string;
    model: string;
    provider: string;
    schema: any;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<GenerateObjectOutput<T>> {
    const entry = this.getProviderEntry(input.provider);
    if (!entry) {
      throw new Error(`Provider ${input.provider} no soportado`);
    }

    const model = entry.provider.languageModel(input.model);
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    if (input.systemPrompt) {
      messages.push({ role: 'system', content: input.systemPrompt });
    }
    messages.push({ role: 'user', content: input.prompt });

    const response = await model.doGenerate({
      mode: { type: 'generate-object', schema: input.schema },
      messages,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    const object = response.finishReason === 'stop' ? response.object : null;
    const usage = AiUsage.fromSdk({
      promptTokens: response.usage?.promptTokens ?? 0,
      completionTokens: response.usage?.completionTokens ?? 0,
      totalTokens: response.usage?.totalTokens ?? 0,
    });

    return {
      object: object as T,
      usage: usage.toJSON(),
      model: input.model,
      provider: input.provider,
    };
  }

  async streamText(input: {
    prompt: string;
    model: string;
    provider: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    onChunk?: (chunk: string) => void;
  }): Promise<void> {
    const entry = this.getProviderEntry(input.provider);
    if (!entry) {
      throw new Error(`Provider ${input.provider} no soportado`);
    }

    const model = entry.provider.languageModel(input.model);
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    if (input.systemPrompt) {
      messages.push({ role: 'system', content: input.systemPrompt });
    }
    messages.push({ role: 'user', content: input.prompt });

    const stream = await model.doStream({
      mode: { type: 'generate-text' },
      messages,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    for await (const chunk of stream.fullStream) {
      if (chunk.type === 'text-delta' && input.onChunk) {
        input.onChunk(chunk.textDelta);
      }
    }
  }

  async streamObject<T>(input: {
    prompt: string;
    model: string;
    provider: string;
    schema: any;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    onChunk?: (partial: T) => void;
  }): Promise<void> {
    const entry = this.getProviderEntry(input.provider);
    if (!entry) {
      throw new Error(`Provider ${input.provider} no soportado`);
    }

    const model = entry.provider.languageModel(input.model);
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    if (input.systemPrompt) {
      messages.push({ role: 'system', content: input.systemPrompt });
    }
    messages.push({ role: 'user', content: input.prompt });

    const stream = await model.doStream({
      mode: { type: 'generate-object', schema: input.schema },
      messages,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    for await (const chunk of stream.fullStream) {
      if (chunk.type === 'object-delta' && input.onChunk) {
        input.onChunk(chunk.objectDelta);
      }
    }
  }

  async chat(input: {
    messages: Array<{ role: string; content: string }>;
    model: string;
    provider: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<ChatOutput> {
    const entry = this.getProviderEntry(input.provider);
    if (!entry) {
      throw new Error(`Provider ${input.provider} no soportado`);
    }

    const model = entry.provider.languageModel(input.model);

    const sdkMessages = input.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const response = await model.doGenerate({
      mode: { type: 'generate-text' },
      messages: sdkMessages,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    const text = response.finishReason === 'stop' ? response.text : '';
    const usage = AiUsage.fromSdk({
      promptTokens: response.usage?.promptTokens ?? 0,
      completionTokens: response.usage?.completionTokens ?? 0,
      totalTokens: response.usage?.totalTokens ?? 0,
    });

    return {
      text,
      usage: usage.toJSON(),
      model: input.model,
      provider: input.provider,
    };
  }
}