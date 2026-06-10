# Nucleous Framework

Framework backend modular basado en [NestJS](https://nestjs.com/) para aplicaciones empresariales con soporte multi-tenant.

## Características

- **Arquitectura Modular**: Solo incluye los módulos que necesitas. Módulos opcionales como AI se activan mediante `ENABLED_MODULES`.
- **Multi-Tenant**: Soporte nativo de `businessId` para aislamiento de datos por empresa.
- **Patrón Domain/Infrastructure**: Lógica de negocio pura separada de la infraestructura (Drizzle, NestJS).
- **Autenticación**: Integrado con [Better Auth](https://better-auth.com/) para auth fluido.
- **Schema Drizzle**: Un cliente Drizzle compartido para todas las tablas del sistema.

## Estructura del Proyecto

```
nucleous-framework/
├── apps/
│   └── api-default/           # Aplicación compositora
├── src/                       # Módulos del framework
│   ├── core/                  # Módulo base (obligatorio)
│   ├── auth/                  # Módulo de auth (obligatorio)
│   └── ai/                    # Módulo AI (opcional)
└── packages/
    └── database/              # Schema Drizzle compartido
```

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo con hot-reload (tsx watch)
npm run start:dev

# Build de la aplicación
npm run build:app

# Ejecutar tests
npm run test

# Tests con coverage
npm run test:cov

# Build para producción
npm run build
```

## Configuración

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=postgres://user:password@localhost:5432/nucleous

# Auth
BETTER_AUTH_SECRET=tu-secret-aqui

# Módulos opcionales (separados por coma)
ENABLED_MODULES=AI

# Configuración de IA (opcional)
OPENROUTER_API_KEY=sk-...
```

## Documentación

La documentación completa está en la carpeta `/docs`:

| Guía | Descripción |
|------|-------------|
| [docs/README.md](docs/README.md) | Índice de toda la documentación |
| [docs/01-core-overview.md](docs/01-core-overview.md) | Arquitectura general del framework |
| [docs/plan-modular.md](docs/plan-modular.md) | Modelo de módulos opcionales |
| [docs/07-extending-core.md](docs/07-extending-core.md) | Cómo crear nuevos módulos |
| [docs/AiModule/01-ai-module-overview.md](docs/AiModule/01-ai-module-overview.md) | Módulo de IA |

## Módulos

### Obligatorios

| Módulo | Descripción |
|--------|-------------|
| `core` | Entidades base, businessId, auditoría |
| `auth` | Autenticación y autorización |

### Opcionales

| Módulo | Descripción | Habilitar |
|--------|-------------|-----------|
| `ai` | Integración con LLMs (OpenRouter, OpenAI, etc.) | `ENABLED_MODULES=AI` |
| `mail` | Envío de emails | `ENABLED_MODULES=MAIL` |
| `storage` | Almacenamiento de archivos | `ENABLED_MODULES=STORAGE` |

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10
- **ORM**: Drizzle ORM
- **Auth**: Better Auth
- **Lenguaje**: TypeScript
- **Testing**: Vitest

## Licencia

MIT