# Integración del Módulo AI

## Carga Automática en AppModule

El `AiModule` es un **módulo global** que se carga una sola vez en `AppModule`. Una vez importado, todos los módulos de la aplicación tienen acceso a `AiService` sin importaciones adicionales.

```typescript
// apps/api-default/app.module.ts
import { Module } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { AiModule } from '../../src/ai/ai.module';
import { validateEnabledModules, getEnabledModules } from './module-validator';

validateEnabledModules();

const enabledModules = getEnabledModules();

const imports: Type<any>[] = [
  DatabaseModule,
  AuthModule,
  CoreModule,
];

if (enabledModules.includes('AI')) {
  imports.push(AiModule);
}

@Module({ imports })
export class AppModule {}
```

## Habilitación mediante ENABLED_MODULES

El módulo AI se activa condicionalmente:

```env
# .env - Habilitar AI
ENABLED_MODULES=AI
```

Sin esta variable o sin `AI` en la lista, el módulo no se carga.

## Log de Inicialización

Al iniciar la aplicación con AI habilitado, verás:

```
[Nest] 17776  - 10/06/2026, 1:41:27 p.m.     LOG [AiService] AiService inicializado
```

Este log confirma que:
1. El módulo se cargó correctamente
2. Los providers están inyectados
3. Los modelos están registrados
4. El rate limiter está activo

## Tokens de Inyección

### Tokens Disponibles

```typescript
// src/ai/application/ai.tokens.ts
export const AI_SERVICE = Symbol('AI_SERVICE');
export const AI_SDK_CLIENT = Symbol('AI_SDK_CLIENT');
export const AI_MODEL_REGISTRY = Symbol('AI_MODEL_REGISTRY');
export const AI_RATE_LIMITER = Symbol('AI_RATE_LIMITER');
export const AI_CONFIG = Symbol('AI_CONFIG');
```

### Inyección Típica

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

## Configuración desde Variables de Entorno

`AiConfig.fromEnv()` lee automáticamente:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | API key para OpenRouter | - |
| `OPENAI_API_KEY` | API key para OpenAI | - |
| `ANTHROPIC_API_KEY` | API key para Anthropic | - |
| `GROQ_API_KEY` | API key para Groq | - |
| `MISTRAL_API_KEY` | API key para Mistral | - |
| `PERPLEXITY_API_KEY` | API key para Perplexity | - |
| `AI_GATEWAY_API_KEY` | API key para Gateway | - |
| `AI_DEFAULT_PROVIDER` | Provider por defecto | `openrouter` |
| `AI_DEFAULT_MODEL` | Modelo por defecto | `google/gemma-4-31b-it:free` |
| `AI_DEFAULT_MODEL_ALIAS` | Alias del modelo | `reasoning` |

## Estructura de la Configuración

```typescript
interface AiConfig {
  apiKeys: Record<string, string>;           // API keys por provider
  defaultProvider: string;                   // Provider por defecto
  defaultModel: string;                      // Modelo por defecto
  defaultModelAlias: ModelAlias;             // 'reasoning' | 'fast'
  rateLimits: AiRateLimitConfig;             // Límites por provider/alias
}

interface AiRateLimitConfig {
  provider: Record<string, { maxRequests: number; windowMs: number }>;
  modelAlias: Record<string, { maxRequests: number; windowMs: number }>;
}
```

## Proveedores Soportados

### OpenRouter (Recomendado)

Usa `createOpenAI` con `baseURL` custom:

```typescript
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.getApiKey('openrouter'),
});
```

**Ventajas**: Modelos gratuitos disponibles, API compatible con OpenAI.

### OpenAI

```typescript
const openai = createOpenAI({
  apiKey: config.getApiKey('openai'),
});
```

### Gateway

```typescript
const gateway = createGateway({
  apiKey: config.getApiKey('gateway'),
});
```

## Agregar un Nuevo Provider

Para agregar soporte a un nuevo provider:

1. **Instalar el paquete del provider**:
   ```bash
   npm install @ai-sdk/nuevo-provider
   ```

2. **Agregar API key al .env**:
   ```env
   NUEVO_PROVIDER_API_KEY=tu_key
   ```

3. **Actualizar `AiConfig`**:
   ```typescript
   const apiKeys = {
     openrouter: process.env.OPENROUTER_API_KEY ?? '',
     nuevoProvider: process.env.NUEVO_PROVIDER_API_KEY ?? '',
   };
   ```

4. **Actualizar `AiSdkClient`**:
   ```typescript
   import { createNuevoProvider } from '@ai-sdk/nuevo-provider';

   this.nuevoProvider = createNuevoProvider({
     apiKey: this.config.getApiKey('nuevoProvider'),
   });
   ```

5. **Agregar al switch de `getModel`**:
   ```typescript
   case 'nuevoProvider':
     return this.nuevoProvider(model);
   ```

## Estructura de Archivos del Módulo

```
src/ai/
├── domain/                          # Value objects (puro)
│   ├── ai-role.value.ts
│   ├── ai-message.value.ts
│   ├── ai-usage.value.ts
│   ├── ai-prompt.value.ts
│   ├── ai-response.value.ts
│   └── index.ts
├── application/                     # Servicios (fachada)
│   ├── ai.tokens.ts                 # Símbolos DI
│   ├── ai.service.ts
│   └── ai.service.spec.ts           # Tests unitarios
├── infrastructure/
│   ├── config/
│   │   └── ai.config.ts             # Config desde env
│   ├── clients/
│   │   ├── ai-sdk.client.ts         # SDK wrapper
│   │   └── model-registry.service.ts
│   └── rate-limit/
│       ├── ai-rate-limiter.service.ts
│       ├── ai-rate-limiter.service.spec.ts
│       └── ai-rate-limiter.exception.ts
├── ai.module.ts                     # Módulo global
├── ai.types.ts                      # Interfaces públicas
└── index.ts                         # Barrel exports
```

## Troubleshooting

### "AiService inicializado" no aparece en logs

**Causa**: `AI` no está en `ENABLED_MODULES`.

**Solución**: Agregar `AI` a la variable de entorno:
```env
ENABLED_MODULES=AI
```

### "Missing Authentication header"

**Causa**: La API key no está configurada o no se cargó.

**Solución**: Verificar que `OPENROUTER_API_KEY` esté en `.env` y que se cargue en el entorno.

### Rate limit excedido frecuentemente

**Causa**: Los límites por defecto son muy restrictivos.

**Solución**: Ajustar en `AiConfig.fromEnv()` con overrides.

### Modelo no encontrado

**Causa**: El modelo especificado no existe en el provider.

**Solución**: Verificar el nombre del modelo en la documentación del provider.