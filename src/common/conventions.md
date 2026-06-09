# Convenciones de API

## Query Params Universales

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

## Parámetros de Fecha

Para filtros de rango de fechas, usar `from_date` y `to_date` en formato ISO8601:

```
GET /core/activities?from_date=2026-01-01&to_date=2026-01-31
```

### Valores Predefinidos de Rango (`date_range`)

| Valor | Descripción |
|-------|-------------|
| `TODAY` | Día actual |
| `THIS_WEEK` | Semana actual (lunes a domingo) |
| `THIS_MONTH` | Mes actual |
| `LAST_7_DAYS` | Últimos 7 días |
| `LAST_30_DAYS` | Últimos 30 días |
| `LAST_90_DAYS` | Últimos 90 días |

Ejemplo:
```
GET /core/activities?date_range=TODAY
GET /core/activities?date_range=THIS_WEEK
```

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