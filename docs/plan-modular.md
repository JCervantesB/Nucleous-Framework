# Plan: Modelo Modular de Nucleous Framework

## 1. Visión General

Nucleous Framework es un **monorepo modular** donde todo el código vive en un solo repositorio, pero cada despliegue (app) decide qué módulos importar y usar.

### Principios Fundamentales

1. **Un solo repo, múltiples módulos**: Todo el código fuente está en `nucleous-framework`
2. **Importación explícita**: Cada `app.module.ts` declara qué módulos usa
3. **Core como base**: `src/core/` es el único módulo obligatorio
4. **Módulos opcionales**: `ai/`, `storage/`, `mail/`, `notifications/`, etc. son transversales
5. **Módulos de negocio**: `inventory/`, `customers/`, etc. encapsulan lógica de dominio
6. **Sin publicación NPM**: Por ahora, los módulos no se publican como paquetes independientes

> **Nota**: En la implementación actual, la aplicación está en `apps/api-default/`. En este documento `app/` se refiere genéricamente a cualquier app en esa carpeta.

### Objetivos del Modelo

- Permitir que diferentes apps usen diferentes combinaciones de módulos
- Mantener independencia entre módulos (sin acoplamiento circular)
- Facilitar el desarrollo aislado de nuevos módulos
- Mantener la simplicidad de un solo repositorio

---

## 2. Estructura de Carpetas Propuesta

```
nucleous-framework/
├── src/                         # Código fuente de módulos
│   ├── core/                    # Módulo base (OBLIGATORIO)
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── application/
│   │   └── core.module.ts
│   │
│   ├── auth/                    # Módulo de autenticación (base)
│   │   └── auth.module.ts
│   │
│   ├── ai/                      # Módulo transversal (opcional)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── ai.module.ts
│   │
│   ├── storage/                 # Módulo transversal (opcional, futuro)
│   ├── mail/                    # Módulo transversal (opcional, futuro)
│   ├── notifications/           # Módulo transversal (opcional, futuro)
│   ├── inventory/               # Módulo de negocio (opcional, futuro)
│   ├── customers/               # Módulo de negocio (opcional, futuro)
│   │
│   └── common/                  # Utilidades compartidas
│       ├── conventions.md
│       └── helpers/
│
├── packages/                    # Paquetes internos (no publicables)
│   └── database/
│       └── src/
│           └── schema/          # Definiciones Drizzle (tablas compartidas)
│
├── app/                         # Aplicaciones de ejemplo/despliegue
│   ├── app.module.ts           # Composición de módulos para ESTA app
│   └── main.ts                  # Bootstrap
│
├── docs/                        # Documentación
│   └── AiModule/                # Documentación del módulo AI                
    └── plan-modular.md          # Este documento
```

### Regla de Dependencias

```
┌─────────────────────────────────────────────────────────────┐
│                      app/app.module.ts                       │
│            (composer - decide qué módulos importar)          │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │CoreModule│       │ AuthModule│       │  AiModule│
    └──────────┘       └──────────┘       └──────────┘
          │                   │                   │
          │                   │                   │
          ▼                   ▼                   ▼
    ┌─────────────────────────────────────────────────────┐
    │                    packages/database/                │
    │              (schema compartido - solo lectura)      │
    └─────────────────────────────────────────────────────┘
```

**Regla clave**: Los módulos pueden depender de `core` y `packages/database`, pero `core` y `packages/database` NO dependen de ningún módulo opcional.

---

## 3. Modelo de Módulos

### 3.1 Módulos Obligatorios

| Módulo | Descripción | Notas |
|--------|-------------|-------|
| `core` | Entidades base, businessId, multi-tenant | Siempre presente |
| `auth` | Autenticación/autorización | Base para todos los módulos |

### 3.2 Módulos Transversales Opcionales

| Módulo | Descripción | Dependencias |
|--------|-------------|--------------|
| `ai` | Integración con LLMs (OpenRouter, OpenAI, etc.) | `core`, `auth` |
| `storage` | Almacenamiento de archivos | `core`, `auth` |
| `mail` | Envío de emails | `core`, `auth` |
| `notifications` | Sistema de notificaciones | `core`, `auth` |

### 3.3 Módulos de Negocio Opcionales

| Módulo | Descripción | Dependencias |
|--------|-------------|--------------|
| `inventory` | Gestión de inventario | `core`, `auth` |
| `customers` | Gestión de clientes | `core`, `auth` |
| `orders` | Gestión de pedidos | `core`, `auth`, `inventory` |

---

## 4. Sistema de Habilitación de Módulos

### 4.1 Variable de Entorno `ENABLED_MODULES`

Cada app define qué módulos usar mediante la variable de entorno:

```env
# .env para api-full
ENABLED_MODULES=AI,MAIL,INVENTORY,NOTIFICATIONS

# .env para api-lite
ENABLED_MODULES=
```

### 4.2 Sistema de Registry Centralizado

En lugar de分散ar las validaciones y imports, se usa un **registry centralizado** en `apps/api-default/module-registry.ts`:

```typescript
// apps/api-default/module-registry.ts
import { AiModule } from '../../src/ai/ai.module';
import { EmailModule } from '../../src/email/email.module';
import { StorageModule } from '../../src/storage/storage.module';

export interface ModuleRegistryEntry {
  name: string;
  module: Type;
}

const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  { name: 'AI', module: AiModule },
  { name: 'EMAIL', module: EmailModule },
  { name: 'STORAGE', module: StorageModule },
];

export const VALID_MODULES = MODULE_REGISTRY.map(m => m.name);

export function getModulesToLoad(envModules: string[]): Type[] {
  return MODULE_REGISTRY
    .filter(entry => envModules.includes(entry.name))
    .map(entry => entry.module);
}

export function validateModules(modules: string[]): string[] {
  const invalid = modules.filter(m => !VALID_MODULES.includes(m));
  if (invalid.length > 0) {
    throw new Error(
      `Módulos inválidos: ${invalid.join(', ')}. Válidos: ${VALID_MODULES.join(', ')}`,
    );
  }
  return modules;
}
```

### 4.3 AppModule Uso del Registry

```typescript
// apps/api-default/app.module.ts
import 'dotenv/config';
import { Module, type Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { getModulesToLoad, validateModules } from './module-registry';

const envModules = (process.env.ENABLED_MODULES ?? '')
  .split(',')
  .map(m => m.trim().toUpperCase())
  .filter(Boolean);

validateModules(envModules);

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CoreModule,
    ...getModulesToLoad(envModules),  // ← Expansión automática
  ],
})
export class AppModule {}
```

### 4.4 Agregar un Nuevo Módulo

Para agregar un nuevo módulo al sistema:

1. **Crear el módulo** en `src/{module-name}/`

2. **Registrar en `module-registry.ts`**:
```typescript
import { NuevoModule } from '../../src/nuevo/nuevo.module';

const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  // ... módulos existentes
  { name: 'NUEVO', module: NuevoModule },  // ← Agregar aquí
];

export const VALID_MODULES = MODULE_REGISTRY.map(m => m.name);
```

3. **Listo** - El módulo se cargará automáticamente cuando `ENABLED_MODULES=NUEVO` esté en el `.env`.

**No es necesario modificar `app.module.ts`** para agregar módulos.

---

## 5. Patrón de Módulo NestJS

Cada módulo sigue la misma estructura:

```
src/{module-name}/
├── domain/                      # Lógica pura (entidades, value objects, interfaces)
│   ├── entities/
│   ├── repositories/            # Interfaces de repositorio (contratos)
│   ├── value-objects/
│   └── {module-name}.types.ts   # Tipos e interfaces públicas
│
├── application/                 # Casos de uso, servicios de app
│   ├── {module-name}.service.ts
│   ├── {module-name}.tokens.ts  # Símbolos DI
│   └── use-cases/
│
├── infrastructure/              # Implementaciones externas
│   ├── persistence/             # Drizzle, repositorios
│   ├── external/                # APIs externas, SDKs
│   └── config/
│
├── {module-name}.module.ts      # Wiring del módulo
└── index.ts                     # Exports públicos
```

### Ejemplo: Estructura de `src/ai/`

```
src/ai/
├── domain/
│   ├── ai-role.value.ts
│   ├── ai-message.value.ts
│   ├── ai-usage.value.ts
│   ├── ai-prompt.value.ts
│   ├── ai-response.value.ts
│   └── index.ts
├── application/
│   ├── ai.tokens.ts
│   ├── ai.service.ts
│   └── ai.service.spec.ts
├── infrastructure/
│   ├── config/
│   │   └── ai.config.ts
│   ├── clients/
│   │   ├── ai-sdk.client.ts
│   │   └── model-registry.service.ts
│   └── rate-limit/
│       ├── ai-rate-limiter.service.ts
│       └── ai-rate-limiter.exception.ts
├── ai.module.ts
└── index.ts
```

---

## 6. Múltiples Apps (apps/)

Si en el futuro se necesitan múltiples apps con diferentes configuraciones:

```
apps/
├── api-full/                   # App completa
│   ├── app.module.ts          # Core + Auth + AI + Mail + Inventory + Notifications
│   └── main.ts
│
├── api-lite/                   # App mínima
│   ├── app.module.ts          # Solo Core + Auth
│   └── main.ts
│
└── api-admin/                  # App de administración
    ├── app.module.ts          # Core + Auth + Customers + Inventory
    └── main.ts
```

### Estrategia de Routing

Usarmonorepo-style con workspaces o simplemente múltiples `main.ts` que importan diferentes `app.module.ts`.

---

## 7. Flujo de Desarrollo de un Nuevo Módulo

### Paso 1: Crear Branch

```bash
git checkout -b feat/mail-module
```

### Paso 2: Desarrollar el Módulo

Crear `src/mail/` con la estructura completa:

```
src/mail/
├── domain/
├── application/
├── infrastructure/
└── mail.module.ts
```

### Paso 3: Tests

Agregar tests en `src/mail/**/*.spec.ts`

### Paso 4: Merge a Main

Una vez listo y validado, merge a `main` (o PR review).

### Paso 5: Integración en App

En `app/app.module.ts`, agregar:

```typescript
...(enabledModules.includes('MAIL') ? [MailModule.forRoot({ /* config */ })] : []),
```

## 8. Variables de Entorno por Módulo

Cada módulo define sus propias variables de entorno. Se documentan en `docs/{ModuleName}/`.

### Ejemplo: Variables del Módulo AI

```env
# AI Module
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
AI_DEFAULT_PROVIDER=openrouter
AI_DEFAULT_MODEL=google/gemma-4-31b-it:free
AI_DEFAULT_MODEL_ALIAS=reasoning
```

### Ejemplo: Variables del Módulo Mail

```env
# Mail Module
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASSWORD=secret
MAIL_FROM=noreply@example.com
```

---

## 9. Reglas de Arquitectura

### Regla 1: Independencia del Core

`src/core/` NO debe importar ningún módulo opcional.

```typescript
// ✅ Correcto: core no sabe de ai
// src/core/domain/entities/business.entity.ts
import { Entity } from '../../common/entity';

// ❌ Incorrecto: core dependiendo de ai
// import { AiService } from '../../ai/application/ai.service';
```

### Regla 2: Módulos Conocen Core, Core No Conoce Módulos

```
ai ──────► core (✅ ai depende de core)
mail ────► core (✅ mail depende de core)
inventory ──► core (✅ inventory depende de core)

core ────► ai (❌ NO)
core ────► mail (❌ NO)
```

### Regla 3: Sin Acoplamiento Circular

```
ai ──────► core ──────► database (✅)
                ▲
                │
                └───── ai NO debe importar algo que importe core directamente
```

### Regla 4: Interfaz Pública Mínima

Cada módulo expone solo lo necesario:

```typescript
// src/ai/index.ts - Exports públicos
export { AiModule } from './ai.module';
export { AI_SERVICE } from './application/ai.tokens';
export { AiService } from './application/ai.service';
export * from './domain';  // Value objects públicos
```

### Regla 5: Módulos Transversales Son Globales

Los módulos transversales (`ai`, `storage`, `mail`, etc.) se declaran como `@Global()` para estar disponibles en toda la app sin imports explícitos en cada módulo consumidor.

---

## 10. Migración del Estado Actual

### Estado Actual

```
src/
├── main.ts                     # Bootstrap
├── app.module.ts              # Módulo raíz (TODO)
├── db/                        # Cliente Drizzle
├── auth/                      # Auth module
├── core/                      # Core module
├── common/                    # Utilidades
└── ai/                        # AI module (recién mergeado)
```

### Estado Objetivo

```
src/
├── core/                      # Módulo base (obligatorio)
├── auth/                      # Módulo de auth (obligatorio)
├── ai/                        # Módulo AI (opcional, controlado por ENABLED_MODULES)
├── storage/                   # (futuro)
├── mail/                      # (futuro)
├── notifications/             # (futuro)
├── inventory/                 # (futuro)
├── customers/                 # (futuro)
├── common/                    # Utilidades compartidas
└── db/                        # Cliente Drizzle (reubicado a packages/database/)

app/
├── app.module.ts              # Compositor de módulos
└── main.ts                    # Bootstrap
```

### Pasos de Migración

1. **Mover `src/db/` a `packages/database/`**
   - Mantener compatibilidad con imports existentes
   - Actualizar paths en `tsconfig.json`

2. **Crear `app/app.module.ts`**
   - Extraer la composición de módulos desde el actual `src/app.module.ts`
   - Implementar sistema `ENABLED_MODULES`

3. **Crear `app/main.ts`**
   - Mover bootstrap desde `src/main.ts`

4. **Refactorizar `src/app.module.ts`**
   - Renombrar a `src/legacy-app.module.ts` temporalmente
   - O eliminar si `app/app.module.ts` lo reemplaza completamente

5. **Mover `src/main.ts` a `app/main.ts`**
   - Asegurar que los paths de imports funcionen

6. **Actualizar documentación**
   - Agregar `docs/AiModule/` con documentación del AI module

---

## 11. Checklist de Implementación

### Fase 1: Estructura Base

- [ ] Crear carpeta `app/`
- [ ] Crear `app/main.ts` (copia del actual `src/main.ts`)
- [ ] Crear `app/app.module.ts` con sistema `ENABLED_MODULES`
- [ ] Mover `src/db/` a `packages/database/`
- [ ] Actualizar `tsconfig.json` paths
- [ ] Probar que la app compila y arranca

### Fase 2: Limpieza

- [ ] Eliminar `src/app.module.ts` (reemplazado por `app/app.module.ts`)
- [ ] Eliminar `src/main.ts` (reemplazado por `app/main.ts`)
- [ ] Actualizar scripts en `package.json` si es necesario

### Fase 3: Documentación

- [ ] Recrear `docs/AiModule/` (se perdió durante limpieza de commits)
- [ ] Crear `docs/CoreModule/` (basado en docs existentes)
- [ ] Actualizar README con nueva estructura

### Fase 4: Módulos Futuros (planificación)

- [ ] Definir estructura de `src/storage/`
- [ ] Definir estructura de `src/mail/`
- [ ] Definir estructura de `src/notifications/`

---

## 12. Cómo Añadir un Nuevo Módulo (Checklist)

Sigue este checklist para agregar un nuevo módulo al repositorio:

### Paso 1: Crear la Estructura

```bash
# Crear carpeta del módulo
mkdir -p src/{module-name}/domain/entities
mkdir -p src/{module-name}/domain/repositories
mkdir -p src/{module-name}/domain/value-objects
mkdir -p src/{module-name}/application
mkdir -p src/{module-name}/infrastructure/persistence
mkdir -p src/{module-name}/infrastructure/http
```

### Paso 2: Implementar el Módulo

1. **Domain** (`src/{module-name}/domain/`)
   - Crear entidades puras (sin imports de frameworks)
   - Definir interfaces de repositorio
   - Agregar value objects si aplica
   - Exportar tipos públicos en `{module-name}.types.ts`

2. **Application** (`src/{module-name}/application/`)
   - Crear servicio principal (`{ModuleName}Service`)
   - Definir tokens DI en `{module-name}.tokens.ts`
   - Implementar use cases si corresponde

3. **Infrastructure** (`src/{module-name}/infrastructure/`)
   - Implementar repositorios Drizzle
   - Crear controllers HTTP
   - Configurar cualquier integración externa

4. **Module** (`src/{module-name}/{module-name}.module.ts`)
   - Declarar providers
   - Usar `@Global()` si es módulo transversal
   - Exportar servicios públicos

### Paso 3: Registrar en module-registry.ts

```typescript
// apps/api-default/module-registry.ts
import { NuevoModule } from '../../src/nuevo/nuevo.module';

const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  // ... módulos existentes
  { name: 'NUEVO', module: NuevoModule },  // ← Agregar aquí
];

export const VALID_MODULES = MODULE_REGISTRY.map(m => m.name);
```

### Paso 4: Habilitar en .env

```env
ENABLED_MODULES=AI,STORAGE,NUEVO
```

**No es necesario modificar `app.module.ts`** - el registry se encarga automáticamente.

### Paso 5: Documentar

1. Crear `docs/{ModuleName}/` con:
   - `01-{module-name}-overview.md` - Visión general
   - `02-{module-name}-usage.md` - Ejemplos de uso
   - `integration.md` - Guía de integración y configuración

2. Agregar variables de entorno necesarias a `.env`

### Paso 6: Variables de Entorno

Agregar al `.env` del proyecto las variables específicas del módulo:

```env
# {ModuleName} Module
MODULE_NAME_API_KEY=
MODULE_NAME_CONFIG=value
```

---

## 13. Relación con "Cómo se Integrarían Nuevas Características"

Este plan modular **materializa** lo descrito en `docs/dev/Como se integrarian nuevas caracteristicas.md`.

### Conceptualización Original

```
docs/dev/Como se integrarian nuevas caracteristicas.md describe:
- Módulos: core, customers, inventory, ecommerce
- Cómo se conectan entre sí
- Patrón domain/infrastructure
- Idea de "módulos independientes pero integrables"
```

### Formalización Actual

```
plan-modular.md proporciona:
- Estructura de carpetas formalizada
- Sistema ENABLED_MODULES para activar/desactivar
- AppModule como compositor explícito
- Reglas de dependencia claras
- Checklist para nuevos módulos
- Separación: módulos transversales vs módulos de negocio
```

### Mapeo Directo

| Concepto en "Como se integrarian..." | Implementación en plan-modular |
|-------------------------------------|-------------------------------|
| "Añadir inventory a app.module" | `ENABLED_MODULES=INVENTORY` activa el módulo |
| "Core + customers + inventory" | App elige qué módulos importar |
| "Patrón domain/infrastructure" | Estandarizado para todos los módulos |
| "independiente pero integrable" | Regla: módulos conocen core, core no conoce módulos |

### Módulos Planificados

Siguiendo el documento de integración:

| Módulo | Tipo | Estado | Notas |
|--------|------|--------|-------|
| `core` | Obligatorio | ✅ Implementado | Base del framework |
| `auth` | Obligatorio | ✅ Implementado | Better Auth |
| `ai` | Transversal | ✅ Implementado | AI SDK v6 |
| `customers` | Negocio | 🔲 Pendiente | Basado en contact/contact_address |
| `inventory` | Negocio | 🔲 Pendiente | Productos, stock, movimientos |
| `ecommerce` | Negocio | 🔲 Pendiente | Catálogo sobre inventory |
| `mail` | Transversal | 🔲 Pendiente | Envío de emails |
| `storage` | Transversal | 🔲 Pendiente | Almacenamiento archivos |
| `notifications` | Transversal | 🔲 Pendiente | Sistema de notificaciones |

---

## 14. Mejores Prácticas

### 14.1 Carga de Variables de Entorno

Asegurarse de cargar `.env` **antes** de leer `ENABLED_MODULES`:

```typescript
// apps/api-default/main.ts
import * as dotenv from 'dotenv';

dotenv.config(); // Cargar .env primero

import { AppModule } from './app.module';

// Ahora process.env.ENABLED_MODULES está disponible
```

O usar `@nestjs/config` con `ConfigModule.forRoot()` en el AppModule.

### 14.2 Registry Centralizado

La lista de módulos válidos y su lógica de carga está centralizada en `apps/api-default/module-registry.ts`:

```typescript
// apps/api-default/module-registry.ts
import { AiModule } from '../../src/ai/ai.module';
import { EmailModule } from '../../src/email/email.module';
import { StorageModule } from '../../src/storage/storage.module';

const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  { name: 'AI', module: AiModule },
  { name: 'EMAIL', module: EmailModule },
  { name: 'STORAGE', module: StorageModule },
];

export const VALID_MODULES = MODULE_REGISTRY.map(m => m.name);

export function getModulesToLoad(envModules: string[]): Type[] {
  return MODULE_REGISTRY
    .filter(entry => envModules.includes(entry.name))
    .map(entry => entry.module);
}

export function validateModules(modules: string[]): string[] {
  const invalid = modules.filter(m => !VALID_MODULES.includes(m));
  if (invalid.length > 0) {
    throw new Error(
      `Módulos inválidos: ${invalid.join(', ')}. Válidos: ${VALID_MODULES.join(', ')}`,
    );
  }
  return modules;
}
```

**Para agregar un nuevo módulo**: Solo añadir una entrada en `MODULE_REGISTRY`.

### 14.3 Módulos Transversales vs de Negocio

**Módulos Transversales** (`ai`, `mail`, `storage`, `notifications`):
- Domain muy ligero: value objects y tipos
- No tienen entidades de negocio propias
- Se integran vía interfaces/contratos
- Son `@Global()` para estar disponibles en toda la app

**Módulos de Negocio** (`inventory`, `customers`, `orders`):
- Domain rico: entidades, repositorios, use cases completos
- Tienen tablas propias en la base de datos
- No son `@Global()` (se importan donde se necesitan)
- Ejemplo: `inventory/domain/` tiene `Product`, `Stock`, `Location`, `Move`

### 14.4 Tests por Módulo

Cada módulo incluye sus propios tests:

```
src/ai/
├── application/
│   ├── ai.service.ts
│   └── ai.service.spec.ts      # Unit tests
├── infrastructure/
│   ├── rate-limit/
│   │   └── ai-rate-limiter.service.spec.ts
│   └── clients/
│       └── model-registry.service.spec.ts
└── ai.integration.spec.ts      # Integration tests (si tiene API real)
```

### 14.5 Módulos Transversales: Cuándo Sí y Cuándo No (@Global)

Solo marcar como `@Global()` los módulos que son **realmente transversales**:

| Módulo | ¿@Global()? | Justificación |
|--------|-------------|---------------|
| `ai` | ✅ Sí | Servicios de IA son consumidos por muchos módulos |
| `storage` | ✅ Sí | Todos los módulos pueden necesitar subir archivos |
| `mail` | ✅ Sí | Notificaciones email pueden venir de cualquier lugar |
| `notifications` | ⚠️ Depende | Si el servicio es genérico (push, email, SMS), sí. Si es muy específico del negocio, no |

**Regla práctica**: Si el módulo NO tiene entidades propias de negocio Y sus servicios son consumidos por múltiples módulos, usar `@Global()`.

### 14.6 Migraciones de Base de Datos

Cuando se implementen múltiples módulos con tablas propias:

```
packages/database/
└── migrations/
    ├── 001_initial.sql           # Schema base (core)
    ├── 002_core_add_users.sql    # Extensiones del core
    ├── 003_ai_tables.sql         # Tablas del módulo AI (si necesita)
    ├── 004_inventory_tables.sql  # Tablas del módulo inventory
    └── 005_customers_tables.sql  # Tablas del módulo customers
```

**Criterio**: Todas las migraciones en `packages/database/migrations/`, nombradas con prefijo numérico y opcionalmente el nombre del módulo.

---

## 15. Preguntas Abiertas

1. **¿Mantener `src/main.ts` o mover a `app/main.ts`?**
   - Recomendación: Mover a `app/main.ts` para separar "código de framework" de "código de app"

2. **¿Renombrar `app/` a algo más descriptivo?**
   - Opciones: `apps/`, `deployment/`, `instances/`
   - Recomendación: `apps/` para indicar que pueden haber múltiples

3. **¿Cómo manejar migraciones de base de datos?**
   - Cada módulo define sus propias migraciones?
   - ¿Unificar en `packages/database/migrations/`?

4. **¿Los tests van en `src/` o en `test/`?**
   - Actualmente Jest busca en `src/` con patrón `*.spec.ts`
   - Los de integración están en `test/`
   - Recomendación: Mantener `src/` para unit tests, `test/` para e2e

5. **¿Los módulos opcionales necesitan estar en subcarpetas de `src/`?**
   - Ejemplo: `src/modules/ai/` vs `src/ai/`
   - Recomendación: `src/{module-name}/` directamente para simplicidad

---

## 13. Próximos Pasos

1. **Revisar y aprobar este plan**
2. **Crear branch `feat/restructuring` desde `main` o `dev`**
3. **Implementar Fase 1 (Estructura Base)**
4. **Validar que todo funciona**
5. **Merge a `dev` o `main`**
6. **Continuar con Fase 2 (Limpieza)**

---

## 14. Referencias

- NestJS Modules: https://docs.nestjs.com/modules
- NestJS Global Modules: https://docs.nestjs.com/modules#global-modules
- Multi-tenant Architecture: https://docs.nestjs.com/techniques/database#async-configuration