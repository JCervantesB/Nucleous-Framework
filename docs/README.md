# Documentación del Nucleous Framework

## Guía de Lectura

Esta documentación está organizada para ser leída en orden. Empieza por `01-core-overview.md` y sigue la numeración.

## Estructura

### Fundamentos
| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 1 | `01-core-overview.md` | Arquitectura general, capas, estructura del proyecto |
| 2 | `02-core-domain.md` | Entidades del dominio, interfaces de repositorio |
| 3 | `03-core-use-cases.md` | Casos de uso y patrones de implementación |
| 4 | `04-core-http-api.md` | Controladores HTTP, endpoints, formato de respuestas |
| 5 | `05-core-auth-and-context.md` | Autenticación Better Auth, contexto de negocio |

### Herramientas y Convenciones
| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 6 | `06-conventions-and-helpers.md` | Convenciones de API, helper de auditoría |

### Guía de Extensión
| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 7 | `07-extending-core.md` | Cómo crear nuevos módulos (Customers, Inventory) |

## Resumen por Rol

### Para Entender el Core
1. `01-core-overview.md` - Visión general
2. `05-core-auth-and-context.md` - Cómo funciona auth
3. `06-conventions-and-helpers.md` - Convenciones que usar

### Para Extender el Framework
1. `01-core-overview.md` - Entender la arquitectura
2. `07-extending-core.md` - Seguir ejemplos de Customers e Inventory

## Referencias Adicionales

Documentación de diseño en `docs/dev/`:
- `04 - Arbol de un solo backend Nest.md` - Estructura completa
- `Como se integrarian nuevas caracteristicas.md` - Patrón de módulos
- `09 - Ejemplo de integración para el módulo Clientes.md` - Caso de uso de customers