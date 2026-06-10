# Documentación del Nucleous Framework

## Guía de Lectura

Esta documentación está organizada en secciones. Empieza por los fundamentos y luego explora los módulos opcionales.

## Estructura de Documentación

### Fundamentos (Core)
| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 1 | `01-core-overview.md` | Arquitectura general, estructura del proyecto |
| 2 | `02-core-domain.md` | Entidades del dominio, interfaces de repositorio |
| 3 | `03-core-use-cases.md` | Casos de uso y patrones de implementación |
| 4 | `04-core-http-api.md` | Controladores HTTP, endpoints, formato de respuestas |
| 5 | `05-core-auth-and-context.md` | Autenticación Better Auth, contexto de negocio |

### Herramientas y Convenciones
| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 6 | `06-conventions-and-helpers.md` | Convenciones de API, helper de auditoría |

### Extensión y Módulos
| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 7 | `07-extending-core.md` | Cómo crear nuevos módulos de negocio |

### Módulos Opcionales
| Módulo | Documentación | Descripción |
|--------|---------------|-------------|
| AI | `AiModule/01-ai-module-overview.md` | Integración con LLMs |

## Modelo Modular

Nucleous Framework usa un **modelo modular** que permite elegir qué módulos usar en cada despliegue:

```
nucleous-framework/
├── apps/
│   └── api-default/           # Aplicación principal
│       ├── main.ts            # Bootstrap
│       ├── app.module.ts      # Compositor de módulos
│       └── module-validator.ts
│
├── src/                       # Módulos del framework
│   ├── core/                  # Módulo base (OBLIGATORIO)
│   ├── auth/                  # Módulo de auth (OBLIGATORIO)
│   └── ai/                    # Módulo AI (OPCIONAL, controlado por ENABLED_MODULES)
│
└── packages/
    └── database/              # Schema Drizzle compartido
```

### Módulos Obligatorios
- **core**: Entidades base, businessId, multi-tenant
- **auth**: Autenticación/autorización con Better Auth

### Módulos Opcionales
- **ai**: Integración con LLMs (OpenRouter, OpenAI, etc.)
- **mail**: Envío de emails (futuro)
- **storage**: Almacenamiento de archivos (futuro)
- **notifications**: Sistema de notificaciones (futuro)
- **inventory**: Gestión de inventario (futuro)
- **customers**: Gestión de clientes (futuro)

## Resumen por Rol

### Para Entender el Core
1. `01-core-overview.md` - Visión general
2. `05-core-auth-and-context.md` - Cómo funciona auth
3. `06-conventions-and-helpers.md` - Convenciones que usar

### Para Extender el Framework
1. `01-core-overview.md` - Entender la arquitectura
2. `07-extending-core.md` - Cómo crear nuevos módulos
3. `docs/dev/plan-modular.md` - Modelo de integración de módulos

### Para Usar un Módulo Opccional
1. `docs/AiModule/01-ai-module-overview.md` - Visión general del módulo
2. `docs/AiModule/integration.md` - Cómo integrarlo en tu app

## Habilitación de Módulos

Los módulos opcionales se activan mediante la variable de entorno `ENABLED_MODULES`:

```env
# .env
ENABLED_MODULES=AI,MAIL,STORAGE
```

Para más detalles, ver `docs/dev/plan-modular.md`.

## Referencias Adicionales

Documentación de diseño en `docs/dev/`:
- `plan-modular.md` - Arquitectura modular completa
- `Como se integrarian nuevas caracteristicas.md` - Patrón de módulos