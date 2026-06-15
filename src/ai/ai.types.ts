import { z } from 'zod';

export const KNOWN_PROVIDERS = [
  'openrouter',
  'openai',
  'anthropic',
  'groq',
  'mistral',
  'perplexity',
] as const;
export type KnownAiProvider = (typeof KNOWN_PROVIDERS)[number];
export type AiProvider = KnownAiProvider | (string & {});

export const DEFAULT_MODELS = {
  reasoning: 'google/gemma-4-31b-it:free',
  fast: 'openai/gpt-4o-mini',
} as const;

export type ModelAlias = keyof typeof DEFAULT_MODELS;

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateTextInput {
  prompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  modelAlias?: ModelAlias;
}

export interface GenerateTextOutput {
  text: string;
  usage: AiUsage;
  model: string;
  provider: string;
}

export interface GenerateObjectInput<T = unknown> extends GenerateTextInput {
  schema: z.ZodSchema<T>;
}

export interface GenerateObjectOutput<T> {
  object: T;
  usage: AiUsage;
  model: string;
  provider: string;
}

export interface StreamTextInput extends GenerateTextInput {
  onChunk?: (chunk: string) => void;
}

export interface StreamObjectInput<T> extends GenerateObjectInput<T> {
  onChunk?: (partial: T) => void;
}

export interface ChatInput {
  messages: AiMessage[];
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  modelAlias?: ModelAlias;
}

export interface ChatOutput {
  text: string;
  usage: AiUsage;
  model: string;
  provider: string;
}
