# API HTTP del Core

## Controladores

Los controladores manejan requests/responses HTTP. Ellos:
- Reciben solicitudes HTTP
- Extraen parámetros y body
- Llaman casos de uso
- Retornan respuestas JSON

## Controlador de Salud

Endpoint simple de verificación de salud.

```typescript
// Ubicación: src/core/infrastructure/http/health.controller.ts

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
```

**Endpoint:** `GET /health`

## Controlador de Business

```typescript
// Ubicación: src/core/infrastructure/http/business.controller.ts

@Controller('core/business')
export class BusinessController {
  @Post()
  async create(@Body() body: CreateBusinessDto) { ... }

  @Get(':id')
  async getById(@Param('id') id: string) { ... }
}
```

**Endpoints:**
- `POST /core/business` - Crear negocio
- `GET /core/business/:id` - Obtener negocio por ID

## Controlador de Contact

```typescript
// Ubicación: src/core/infrastructure/http/contact.controller.ts

@Controller('core/contacts')
export class ContactController {
  @Post()
  async create(@Body() body: CreateContactDto) { ... }

  @Get()
  async list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('isCustomer') isCustomer?: boolean,
    @Query('isSupplier') isSupplier?: boolean,
    @Query('isEmployee') isEmployee?: boolean,
  ) { ... }
}
```

**Endpoints:**
- `POST /core/contacts` - Crear contacto
- `GET /core/contacts` - Listar contactos con filtros

## Controlador de Activity

```typescript
// Ubicación: src/core/infrastructure/http/activity.controller.ts

@Controller('core/activities')
export class ActivityController {
  @Post()
  async create(@Body() body: CreateActivityDto) { ... }

  @Post(':id/complete')
  async complete(@Param('id') id: string) { ... }

  @Get('record/:table/:recordId')
  async listForRecord(
    @Param('table') table: string,
    @Param('recordId') recordId: string,
  ) { ... }

  @Get('me')
  async listForUser(@Query() query: ListActivitiesQuery) { ... }
}
```

**Endpoints:**
- `POST /core/activities` - Crear actividad
- `POST /core/activities/:id/complete` - Completar actividad
- `GET /core/activities/record/:table/:recordId` - Listar por registro
- `GET /core/activities/me` - Listar actividades del usuario actual

## Controlador de RecordEvent

```typescript
// Ubicación: src/core/infrastructure/http/record-event.controller.ts

@Controller('core/events')
export class RecordEventController {
  @Post(':table/:id')
  async addEvent(
    @Param('table') table: string,
    @Param('id') id: string,
    @Body() body: AddEventDto,
  ) { ... }

  @Get(':table/:id')
  async listEvents(
    @Param('table') table: string,
    @Param('id') id: string,
  ) { ... }
}
```

**Endpoints:**
- `POST /core/events/:table/:id` - Agregar evento a registro
- `GET /core/events/:table/:id` - Listar eventos de un registro

## Controlador de Config

```typescript
// Ubicación: src/core/infrastructure/http/config.controller.ts

@Controller('core/config')
export class ConfigController {
  @Get()
  async list() { ... }

  @Get(':key')
  async get(@Param('key') key: string) { ... }

  @Post()
  async set(@Body() body: SetConfigDto) { ... }
}
```

**Endpoints:**
- `GET /core/config` - Listar todos los parámetros
- `GET /core/config/:key` - Obtener parámetro por key
- `POST /core/config` - Crear/actualizar parámetro

## Patrón DTO

Los controladores usan DTOs (Data Transfer Objects) para validación de entrada:

```typescript
class CreateBusinessDto {
  name!: string;
  slug!: string;
  legalName?: string;
  countryCode?: string;
  timezone?: string;
  currencyCode?: string;
  publicName?: string;
}
```

## Formato de Respuesta

### Respuesta de Éxito

```typescript
return {
  id: business.id,
  name: business.name,
  // ... campos
};
```

### Respuesta de Error

```typescript
return { error: 'Negocio no encontrado' };
```

### Respuesta de Lista con Paginación

```typescript
return {
  data: contacts,
  pagination: {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  },
};
```

## Convenciones de API

Todos los endpoints de listado soportan parámetros comunes de query:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página (1-indexed) |
| `pageSize` | number | 20 | Elementos por página (máx 100) |
| `search` | string | - | Filtro de búsqueda |
| `sortBy` | string | - | Campo de ordenamiento |
| `sortOrder` | 'asc' \| 'desc' | 'asc' | Dirección del orden |
| `from_date` | ISO8601 | - | Fecha inicial |
| `to_date` | ISO8601 | - | Fecha final |
| `date_range` | string | - | Rango predefinido (TODAY, THIS_WEEK, etc.) |

Ver [conventions-and-helpers.md](./conventions-and-helpers.md) para detalles completos.

## Agregar un Nuevo Controlador

1. Crear `src/core/infrastructure/http/<entidad>.controller.ts`
2. Importar casos de uso
3. Agregar decorador `@Controller()` con prefijo de ruta
4. Agregar métodos de acción con decoradores (`@Post`, `@Get`, etc.)
5. Registrar controlador en el array de controllers de `CoreModule`