import { Injectable, Inject } from '@nestjs/common';
import { AI_CONFIG } from '../../application/ai.tokens';
import { AiConfig } from '../config/ai.config';
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

@Injectable()
export class AiSdkClient {
  constructor(@Inject(AI_CONFIG) private readonly config: AiConfig) {}

  async generateText(input: {
    prompt: string;
    model: string;
    provider: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<GenerateTextOutput> {
    throw new Error('Not implemented yet - AI SDK integration pending');
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
    throw new Error('Not implemented yet - AI SDK integration pending');
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
    throw new Error('Not implemented yet - AI SDK integration pending');
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
    throw new Error('Not implemented yet - AI SDK integration pending');
  }

  async chat(input: {
    messages: Array<{ role: string; content: string }>;
    model: string;
    provider: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<ChatOutput> {
    throw new Error('Not implemented yet - AI SDK integration pending');
  }
}