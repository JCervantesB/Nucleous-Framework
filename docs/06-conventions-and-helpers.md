# Convenciones y Helpers

## Convenciones de API

### Query Params Universales

Todos los endpoints de listado deben soportar estos parámetros:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Página actual (1-indexed) |
| `pageSize` | number | 20 | Elementos por página (máx 100, valores mayores se recortan a 100) |
| `search` | string | - | Búsqueda libre (filtro en nombre/título/etc) |
| `sortBy` | string | - | Campo por el cual ordenar |
| `sortOrder` | 'asc' \| 'desc' | 'asc' | Dirección del orden |
| `from_date` | ISO8601 | - | Fecha inicial del rango |
| `to_date` | ISO8601 | - | Fecha final del rango |

### Parámetros de Fecha

Para filtros de rango de fechas, usar `from_date` y `to_date` en formato ISO8601:

```
GET /core/activities?from_date=2026-01-01&to_date=2026-01-31
```

#### Valores Predefinidos de Rango (`date_range`)

| Valor | Descripción |
|-------|-------------|
| `TODAY` | Día actual |
| `THIS_WEEK` | Semana actual (lunes a domingo) |
| `THIS_MONTH` | Mes actual |
| `LAST_7_DAYS` | Últimos 7 días |
| `LAST_30_DAYS` | Últimos 30 días |
| `LAST_90_DAYS` | Últimos 90 días |

**Nota:** Si se usa `date_range`, los parámetros `from_date` y `to_date` se ignoran.

## Convenciones de Paginación

Respuesta de listado:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Campos de Auditoría

Todos los registros incluyen:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `createdAt` | timestamp | Fecha de creación |
| `createdBy` | string | ID del usuario que creó |
| `updatedAt` | timestamp | Fecha de última modificación |
| `updatedBy` | string | ID del usuario que modificó |

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Parámetros inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

## Helper de Auditoría

El archivo `src/common/helpers/audit.helper.ts` provee funciones para manejar campos de auditoría.

### Interfaz AuditFields

```typescript
export interface AuditFields {
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface AuditInput {
  userId?: string | null;
}
```

### Función buildAuditFields

Construye los campos de auditoría para un nuevo registro o actualiza un registro existente:

```typescript
import { buildAuditFields } from '#app/common/helpers/audit.helper.js';

// Para nuevo registro
const audit = buildAuditFields({ userId: 'user-123' });
// Resultado: { createdAt: now, createdBy: 'user-123', updatedAt: null, updatedBy: null }

// Para registro existente
const updated = buildAuditFields({ userId: 'user-456' }, existingAudit);
// Resultado: { createdAt: same, createdBy: same, updatedAt: now, updatedBy: 'user-456' }
```

### Función setUpdatedBy

Actualiza solo los campos de auditoría de modificación:

```typescript
import { setUpdatedBy } from '#app/common/helpers/audit.helper.js';

const record = {
  createdAt: new Date('2026-01-01'),
  createdBy: 'user-123',
  updatedAt: null,
  updatedBy: null,
};

const updated = setUpdatedBy(record, 'user-456');
// Resultado: { ..., updatedAt: now, updatedBy: 'user-456' }
```

### Uso en Repositorios Drizzle

```typescript
// En DrizzleContactRepository.create()
await this._db.insert(contact).values({
  ...fields,
  createdAt: audit.createdAt,
  createdBy: audit.createdBy,
});

// En DrizzleContactRepository.save()
await this._db.update(contact)
  .set({
    ...fields,
    updatedAt: audit.updatedAt,
    updatedBy: audit.updatedBy,
  })
  .where(eq(contact.id, id));
```

## Convenciones de Nombrado

### Entidades
- Nombre de clase: `PascalCase` (ej. `Business`, `Contact`)
- Archivo: `kebab-case` (ej. `business.entity.ts`, `contact.entity.ts`)
- Props interface: `<Entity>Props` (ej. `BusinessProps`)

### Repositorios
- Interfaz: `<Entity>Repository` (ej. `BusinessRepository`)
- Implementación: `Drizzle<Entity>Repository` (ej. `DrizzleBusinessRepository`)
- Token: `<ENTITY>_REPOSITORY` (ej. `BUSINESS_REPOSITORY`)

### Casos de Uso
- Clase: `<Action><Entity>UseCase` (ej. `CreateBusinessUseCase`, `ListContactsUseCase`)
- Archivo: `<kebab-case>.use-case.ts` (ej. `create-business.use-case.ts`)

### Controladores
- Clase: `<Entity>Controller` (ej. `BusinessController`)
- Archivo: `<kebab-case>.controller.ts` (ej. `business.controller.ts`)
- Ruta: `<resource>` (ej. `core/business`)

## Estructura de Rutas API

```
/health                          # Health check
/auth/*path                      # Better Auth routes
/core/business                   # Business CRUD
/core/contacts                   # Contacts CRUD
/core/activities                # Activities CRUD
/core/events                     # Record events
/core/config                     # Configuration parameters
```

## Patrón de Import

Usar alias de path para imports:

```typescript
// Entidades del dominio
import { Business } from '#app/core/domain/entities/business.entity.js';

// Interfaces de repositorio
import type { BusinessRepository } from '#app/core/domain/repositories/business.repository.js';

// Casos de uso
import { CreateBusinessUseCase } from '#app/core/domain/use-cases/create-business.use-case.js';

// Schema Drizzle
import { business } from '#app/database/schema/core.js';

// Helpers
import { buildAuditFields } from '#app/common/helpers/audit.helper.js';
```