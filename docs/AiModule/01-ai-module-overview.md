# Visión General del Módulo AI

## Arquitectura

El módulo AI (`AiModule`) es un **módulo global** de NestJS que proporciona acceso unificado a modelos de lenguaje (LLMs) a través del AI SDK de Vercel. Sigue los mismos principios de arquitectura por capas que el core:

```
src/ai/
├── domain/                    # Value objects puros (sin dependencias externas)
│   ├── ai-role.value.ts       # Enum: USER, ASSISTANT, SYSTEM
│   ├── ai-message.value.ts    # Mensaje con toSdkFormat()
│   ├── ai-usage.value.ts      # Tracking de tokens con fromSdk()
│   ├── ai-prompt.value.ts     # Prompt con withSystemPrompt()
│   └── ai-response.value.ts   # Respuesta con withUsage()
├── application/               # Servicios de aplicación
│   ├── ai.tokens.ts           # Símbolos de inyección (DI tokens)
│   └── ai.service.ts          # Fachada principal con rate limiting
├── infrastructure/            # Implementaciones externas
│   ├── config/
│   │   └── ai.config.ts       # Configuración desde variables de entorno
│   ├── clients/
│   │   ├── ai-sdk.client.ts   # Integración con AI SDK de Vercel
│   │   └── model-registry.service.ts
│   └── rate-limit/
│       ├── ai-rate-limiter.service.ts
│       └── ai-rate-limiter.exception.ts
└── ai.module.ts               # Módulo global (wiring)
```

## Principios de Diseño Clave

### 1. Dominio Puro
La **capa de dominio** (`domain/`) nunca importa el AI SDK, NestJS, ni ningún framework externo. Contiene:
- Value objects inmutables con métodos de transformación (`AiPrompt`, `AiResponse`, `AiMessage`, `AiUsage`)
- Enums para roles (`AiRole`)
- Métodos de fábrica estáticos para construcción tipada

### 2. Fachada como Contrato Público
`AiService` es la **única interfaz pública** del módulo. Detalles de implementación como `AiSdkClient` son internos y no se exportan. Esto permite:
- Cambiar implementaciones de SDK sin afectar consumidores
- Mantener API estable mientras la infraestructura evoluciona

### 3. Rate Limiting Centralizado
El rate limiting se aplica **antes y después** de cada request IA:
- Verifica límites por provider (OpenRouter: 60 req/min)
- Verifica límites por model alias (reasoning: 10 req/min, fast: 60 req/min)
- Lanza `AiRateLimitExceededException` si se excede

### 4. Inyección de Dependencias con Tokens
Los servicios se registran mediante **símbolos (`Symbol`)** no clases, permitiendo:
- Mocking preciso en tests
- Reemplazo de implementaciones
- Inyección por interfaz, no por implementación

## Modelo de Módulos

Este módulo sigue el **modelo modular de Nucleous Framework**:

```
apps/
├── api-default/
│   ├── main.ts                 # Bootstrap
│   ├── app.module.ts          # Compositor de módulos
│   └── module-validator.ts    # VALID_MODULES
│
src/
├── core/                       # Módulo base (obligatorio)
├── auth/                       # Módulo de auth (obligatorio)
└── ai/                         # Módulo AI (opcional, controlado por ENABLED_MODULES)
```

### Habilitación de Módulos

El módulo AI se activa mediante la variable de entorno:

```env
# .env
ENABLED_MODULES=AI
```

## Providers de IA Soportados

| Provider | Paquete | Endpoint | API Key Env |
|----------|---------|----------|-------------|
| OpenRouter | @ai-sdk/openai | `https://openrouter.ai/api/v1` | `OPENROUTER_API_KEY` |
| OpenAI | @ai-sdk/openai | `https://api.openai.com` | `OPENAI_API_KEY` |
| Gateway | @ai-sdk/gateway | Custom | `AI_GATEWAY_API_KEY` |

## Modelos por Defecto

```typescript
const DEFAULT_MODELS = {
  reasoning: 'google/gemma-4-31b-it:free',  // Para tareas complejas
  fast: 'openai/gpt-4o-mini',               // Para tareas rápidas
};
```

## Variables de Entorno

```env
# API Keys
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=...
MISTRAL_API_KEY=...
PERPLEXITY_API_KEY=...
AI_GATEWAY_API_KEY=...

# Configuración por defecto
AI_DEFAULT_PROVIDER=openrouter
AI_DEFAULT_MODEL=google/gemma-4-31b-it:free
AI_DEFAULT_MODEL_ALIAS=reasoning
```

## Tests

El módulo incluye **31 unit tests** cubriendo:

| Suite | Tests | Tipo |
|-------|-------|------|
| AiRateLimiterService | 8 | Unit con mocks |
| ModelRegistryService | 11 | Unit con mocks |
| AiService | 12 | Unit con mocks |

**Total: 31 tests passing**