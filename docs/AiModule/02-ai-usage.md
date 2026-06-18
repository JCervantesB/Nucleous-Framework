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

---

# Guía Avanzada: Crear Servicios IA Personalizados

Esta sección muestra cómo usar `AiService` para crear servicios especializados. El ejemplo está basado en `AIStockForecastService`, un servicio real de forecasting de inventario potenciado por IA.

## Caso de Uso: Stock Forecast con IA

El módulo `StockForecastModule` incluye `AIStockForecastService` que usa `AiService.generateObject()` para generar predicciones de inventario usando un schema Zod.

### Estructura de un Servicio IA Personalizado

```typescript
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { z } from 'zod';
import { AI_SERVICE } from '#app/ai/application/ai.tokens';
import type { AiService } from '#app/ai/application/ai.service';

// 1. Definir el schema Zod para la respuesta
const MyResponseSchema = z.object({
  field1: z.string(),
  field2: z.number(),
  nested: z.object({
    value: z.boolean(),
  }),
});

@Injectable()
export class MyAIService {
  private readonly logger = new Logger(MyAIService.name);

  constructor(
    @Optional() @Inject(AI_SERVICE) private readonly aiService: AiService | null,
  ) {}

  async doSomethingWithAI(input: { data: string }) {
    // 2. Verificar que AI Service está disponible
    if (!this.aiService) {
      throw new Error('AI Module no está cargado. Asegúrese de que AiModule esté habilitado.');
    }

    // 3. Construir el prompt
    const prompt = this.buildPrompt(input);

    // 4. Llamar a generateObject con el schema
    const result = await this.aiService.generateObject({
      prompt,
      schema: MyResponseSchema,
    });

    return result.object;
  }

  private buildPrompt(input: { data: string }): string {
    return `Tu prompt aquí...`;
  }
}
```

### Ejemplo Real: AIStockForecastService

Este es el código real usado en `src/stock-forecast/infrastructure/ai/ai-stock-forecast.service.ts`:

```typescript
import { Inject, Injectable, Logger, Optional, UnprocessableEntityException } from '@nestjs/common';
import { z } from 'zod';
import { AI_SERVICE } from '../../../ai/application/ai.tokens';
import type { AiService } from '../../../ai/application/ai.service';

// Schema Zod para validar la respuesta de la IA
const AiForecastResponseSchema = z.object({
  currentStock: z.number(),
  consumptionRate: z.number(),
  daysUntilStockout: z.number().nullable(),
  confidence: z.number().min(0).max(1),
  predictions: z.array(
    z.object({
      date: z.string(),
      predictedQuantity: z.number(),
      lowerBound: z.number(),
      upperBound: z.number(),
    }),
  ),
});

type AiForecastResponse = z.infer<typeof AiForecastResponseSchema>;

@Injectable()
export class AIStockForecastService implements StockForecastProvider {
  private readonly logger = new Logger(AIStockForecastService.name);

  constructor(
    @Optional() @Inject(AI_SERVICE) private readonly aiService: AiService | null,
  ) {}

  async forecast(params: ForecastParams): Promise<ForecastResult> {
    // Verificar configuración
    const enabled = process.env.AI_STOCK_FORECAST_ENABLED === 'true';
    if (!enabled) {
      throw new UnprocessableEntityException(
        'Predicción con IA no está habilitada. Configure AI_STOCK_FORECAST_ENABLED=true',
      );
    }

    if (!this.aiService) {
      throw new UnprocessableEntityException(
        'AI Module no está cargado. Asegúrese de que AiModule esté habilitado.',
      );
    }

    // Validar historial mínimo
    if (params.historicalMoves.length < 30) {
      throw new UnprocessableEntityException(
        'La predicción con IA requiere al menos 30 días de historial',
      );
    }

    const prompt = this.buildPrompt(params);

    try {
      // Llamada a IA con schema Zod
      const result = await this.aiService.generateObject<AiForecastResponse>({
        prompt,
        model: process.env.AI_STOCK_FORECAST_MODEL ?? 'openai/gpt-4o-mini',
        schema: AiForecastResponseSchema,
      });

      // Transformar respuesta al formato esperado
      const predictions: DailyPrediction[] = result.object.predictions.map((p) => ({
        date: p.date.split('T')[0],
        predictedQuantity: p.predictedQuantity,
        lowerBound: p.lowerBound,
        upperBound: p.upperBound,
      }));

      return {
        productId: params.productId,
        currentStock: result.object.currentStock,
        predictedStock: predictions[predictions.length - 1]?.predictedQuantity ?? result.object.currentStock,
        consumptionRate: result.object.consumptionRate,
        daysUntilStockout: result.object.daysUntilStockout,
        confidence: result.object.confidence,
        method: 'AI',
        predictions,
      };
    } catch (error) {
      this.logger.error(`Error en predicción con IA`, error);
      throw new UnprocessableEntityException(
        'Error al generar predicción con IA. Intente con método MATH.',
      );
    }
  }

  private buildPrompt(params: ForecastParams): string {
    const movesSummary = this.summarizeMoves(params.historicalMoves);

    return `
Eres un experto en análisis de inventario y forecasting.

Analiza el siguiente historial de movimientos de inventario y genera predicciones.

## Historial de Movimientos
${movesSummary}

## Requerimientos
- Genera predicciones para los próximos ${params.daysAhead ?? 30} días
- Devuelve el stock actual estimado
- Calcula la tasa de consumo promedio
- Estima cuántos días hasta que se agote el stock
- Asigna un nivel de confianza de 0 a 1

## Formato de Respuesta (JSON)
{
  "currentStock": número,
  "consumptionRate": número (unidades por día),
  "daysUntilStockout": número o null,
  "confidence": número entre 0 y 1,
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "predictedQuantity": número,
      "lowerBound": número,
      "upperBound": número
    }
  ]
}
`;
  }

  private summarizeMoves(moves: HistoricalMove[]): string {
    return moves
      .slice(-30)
      .map((m) => {
        const date = new Date(m.date).toISOString().split('T')[0];
        const type = m.quantity > 0 ? 'CONSUMO' : 'ENTRADA';
        return `${date}: ${type} ${Math.abs(m.quantity)}`;
      })
      .join('\n');
  }
}
```

### Patrones de Prompting Efectivos

#### 1. System Prompt Estructurado

```typescript
const prompt = `
Eres un experto en {dominio}.

Tu tarea es {objetivo específico}.

## Reglas
1. {regla 1}
2. {regla 2}

## Formato de salida
Devuelve SOLO JSON válido con esta estructura:
{schema JSON}
`;
```

#### 2. Few-Shot Prompting con Ejemplos

```typescript
const prompt = `
Clasifica el siguiente texto en categorías predefinidas.

Ejemplos:
- "Me encanta este producto" → {"sentiment": "positive", "score": 0.9}
- "Es terrible, no lo recomiendo" → {"sentiment": "negative", "score": 0.2}
- "Es normal, nada especial" → {"sentiment": "neutral", "score": 0.5}

Texto a clasificar: "${userInput}"

Devuelve SOLO el JSON.
`;
```

#### 3. Chain-of-Thought para Razonamiento

```typescript
const prompt = `
Resuelve el siguiente problema paso a paso.

Problema: {descripción}

Pasos:
1. Identificar variables clave
2. Aplicar fórmulas relevantes
3. Calcular resultado

Respuesta final en JSON:
{schema}
`;
```

### Variables de Entorno para Configuración IA

```env
# Habilitar forecasting con IA
AI_STOCK_FORECAST_ENABLED=true
AI_STOCK_FORECAST_MODEL=openai/gpt-4o-mini

# O usar modelos de razonamiento (más lentos pero más precisos)
# AI_STOCK_FORECAST_MODEL=google/gemma-4-31b-it:free
```

### Manejo de Errores en Servicios IA

```typescript
async myAIOperation(input: any): Promise<Result> {
  try {
    return await this.aiService.generateObject({...});
  } catch (error) {
    if (error instanceof AiRateLimitExceededException) {
      // Rate limit - esperar y reintentar
      this.logger.warn(`Rate limit excedido. Retry en ${error.retryAfterMs}ms`);
      throw new RetryableException(error.retryAfterMs);
    }

    if (error.message.includes('Provider')) {
      // Provider no soportado
      throw new ConfigurationException('Provider IA no configurado');
    }

    // Otros errores - fallback a método alternativo
    this.logger.error(`Error IA: ${error.message}`);
    return this.fallbackMethod(input);
  }
}
```