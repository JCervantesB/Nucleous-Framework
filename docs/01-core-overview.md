# Visión General del Core

## Arquitectura

Nucleous Framework sigue una **arquitectura por capas** con clara separación de responsabilidades. Cada módulo (como `core`) se organiza en cuatro capas principales:

```
src/core/
├── domain/           # Lógica de negocio pura (sin dependencias externas)
│   ├── entities/     # Entidades del dominio
│   ├── repositories/ # Interfaces de repositorio
│   └── use-cases/    # Casos de uso de negocio
├── infrastructure/   # Integraciones externas
│   ├── persistence/  # Implementaciones Drizzle
│   ├── http/         # Controladores NestJS
│   └── database/     # Módulo de base de datos
├── application/      # Servicios de aplicación
│   └── current-business.service.ts
└── core.module.ts    # Wiring del módulo
```

## Principios de Diseño Clave

### 1. Independencia del Dominio
La **capa de dominio nunca importa** Drizzle, NestJS, ni ningún framework externo. Contiene:
- Entidades TypeScript puras con métodos de fábrica
- Interfaces de repositorio (contratos, no implementaciones)
- Casos de uso que orquestan la lógica de negocio

### 2. Infraestructura para Concerns Externos
- **Persistencia**: Implementaciones Drizzle de interfaces de repositorio
- **HTTP**: Controladores NestJS que manejan requests/responses HTTP
- **Base de datos**: Gestión de conexión y tokens DI

### 3. Servicios de Aplicación
Concerns transversales como `CurrentBusinessService` que resuelven contexto (ej. `businessId` para multi-tenant).

## Estructura de Directorios

```
nucleous-framework/
├── src/
│   ├── main.ts                    # Bootstrap de la aplicación
│   ├── app.module.ts             # Módulo raíz
│   ├── db/
│   │   └── client.ts              # Singleton del cliente Drizzle
│   ├── auth/                      # Integración de Better Auth
│   │   ├── better-auth.config.ts
│   │   ├── auth.module.ts
│   │   ├── auth.guard.ts
│   │   └── session.decorator.ts
│   ├── core/                      # Módulo core de negocio
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── application/
│   │   └── core.module.ts
│   └── common/                    # Utilidades compartidas
│       ├── conventions.md
│       └── helpers/
│           └── audit.helper.ts
└── packages/
    └── database/
        └── src/
            └── schema/            # Definiciones de tablas Drizzle
                ├── auth.ts
                └── core.ts
```

## Componentes del Módulo Core

### Capa de Dominio
- **Entidades**: `Business`, `Contact`, `Activity`, `RecordEvent`, `Role`, `UserProfile`, `ConfigParameter`
- **Interfaces de Repositorio**: Contratos para acceso a datos
- **Casos de Uso**: Operaciones de negocio como `CreateBusiness`, `CreateContact`, `CompleteActivity`

### Capa de Infraestructura
- **Persistencia**: Implementaciones Drizzle de cada repositorio
- **HTTP**: Controladores REST que exponen endpoints

### Capa de Aplicación
- **CurrentBusinessService**: Resuelve el `businessId` actual para operaciones multi-tenant

## Dependencias de Módulos

```
AppModule
├── DatabaseModule (global - provee token 'DB')
├── AuthModule (integración Better Auth)
└── CoreModule
    ├── HealthController (GET /health)
    ├── BusinessController (POST/GET /core/business)
    ├── ContactController (POST/GET /core/contacts)
    ├── ActivityController (POST/GET /core/activities)
    ├── RecordEventController (POST/GET /core/events)
    └── ConfigController (GET/POST /core/config)
```

## Alias de Paths

El proyecto usa el campo `imports` de Node.js para resolución de paths:

| Alias | Path en Runtime |
|-------|-----------------|
| `#app/database/*` | `./dist/packages/database/*` |
| `#app/core/*` | `./dist/src/core/*` |
| `#app/auth/*` | `./dist/src/auth/*` |
| `#app/common/*` | `./dist/src/common/*` |

Esto asegura que TypeScript y el runtime usen los mismos paths.