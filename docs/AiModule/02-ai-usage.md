# Uso del Módulo AI

## Inyección de Dependencias

El `AiService` se inyecta usando el token `AI_SERVICE`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { AI_SERVICE } from '#app/ai/application/ai.tokens';
import { AiService } from '#app/ai/application/ai.service';

@Injectable()
export class MiServicio {
  constructor(
    @Inject(AI_SERVICE) private readonly aiService: AiService,
  ) {}
}
```

## generateText

Genera texto a partir de un prompt simple.

```typescript
const result = await this.aiService.generateText({
  prompt: 'What is 2+2?',
});

console.log(result.text);              // Respuesta del modelo
console.log(result.usage.totalTokens); // Tokens consumidos
console.log(result.model);             // 'google/gemma-4-31b-it:free'
console.log(result.provider);          // 'openrouter'
```

**Con opciones**:

```typescript
const result = await this.aiService.generateText({
  prompt: 'Explain quantum computing',
  systemPrompt: 'You are a physics professor. Be concise.',
  model: 'google/gemma-4-31b-it:free',
  provider: 'openrouter',
  temperature: 0.7,
  maxTokens: 500,
});
```

## generateObject

Genera un objeto tipado usando un schema Zod.

```typescript
import { z } from 'zod';

const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  city: z.string(),
});

const result = await this.aiService.generateObject({
  prompt: 'Return ONLY valid JSON like: {"name": "John", "age": 30, "city": "NYC"}',
  schema: PersonSchema,
});

const person = result.object;
// { name: 'John', age: 30, city: 'NYC' }
```

## streamText

Streaming de texto con callbacks para UI progresivas.

```typescript
let fullText = '';

await this.aiService.streamText({
  prompt: 'Write a story about a cat',
  onChunk: (chunk) => {
    fullText += chunk;
  },
});
```

## streamObject

Streaming de objetos con schemas Zod.

```typescript
const RecipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
});

let partialRecipe = {};

await this.aiService.streamObject({
  prompt: 'Generate a recipe for pasta',
  schema: RecipeSchema,
  onChunk: (delta) => {
    partialRecipe = { ...partialRecipe, ...delta };
  },
});
```

## chat

Conversaciones multi-mensaje.

```typescript
const result = await this.aiService.chat({
  messages: [
    { role: 'user', content: 'Say "hello" and nothing else' },
  ],
  maxTokens: 20,
});
```

## Uso con Value Objects del Dominio

### AiPrompt y generateTextWithPrompt

```typescript
import { AiPrompt } from '#app/ai/domain';

const prompt = AiPrompt.create({
  userPrompt: 'What is artificial intelligence?',
  systemPrompt: 'You are an AI expert. Be educational.',
});

const response = await this.aiService.generateTextWithPrompt(prompt);

console.log(response.text);
console.log(response.usage.promptTokens);
```

### AiMessage y chatWithMessages

```typescript
import { AiMessage, AiRole } from '#app/ai/domain';

const messages = [
  AiMessage.system('You are a helpful assistant.'),
  AiMessage.user('Hello!'),
  AiMessage.assistant('Hi there! How can I help you?'),
  AiMessage.user('Tell me about Mars.'),
];

const response = await this.aiService.chatWithMessages(messages);

console.log(response.text);
```

## Model Aliases

Los aliases simplifican la selección de modelo:

```typescript
// 'reasoning' -> google/gemma-4-31b-it:free (tareas complejas)
// 'fast' -> openai/gpt-4o-mini (tareas rápidas)

const result = await this.aiService.generateText({
  prompt: 'Complex reasoning task',
  modelAlias: 'reasoning',
});
```

## Manejo de Errores

```typescript
import { AiRateLimitExceededException } from '#app/ai/infrastructure/rate-limit/ai-rate-limiter.exception';

try {
  const result = await this.aiService.generateText({ prompt: 'Hello' });
} catch (error) {
  if (error instanceof AiRateLimitExceededException) {
    console.log(`Rate limit excedido. Retry en ${error.retryAfterMs}ms`);
  }
}
```

## Rate Limits por Defecto

| Provider | Límite |
|----------|--------|
| openrouter | 60 req/min |
| openai | 120 req/min |
| groq | 30 req/min |

| Model Alias | Límite |
|-------------|--------|
| reasoning | 10 req/min |
| fast | 60 req/min |