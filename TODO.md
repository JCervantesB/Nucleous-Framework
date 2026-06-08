# Nucleous CORE - Plan de Desarrollo

## Fases del CORE

---

## Fase 1: Estructura base del proyecto Nest

> Objetivo: tener un solo proyecto Nest con carpetas bien organizadas y alias de paths,
> sin usar workspaces ni múltiples package.json.

### 1.1 - Crear estructura base del proyecto

**Archivos a crear/editar:**
- `package.json` (único - raíz)
- `tsconfig.json` (único - raíz)

**Detalles:**
- Proyecto NestJS creado con CLI (`nest new`)
- Dependencias: Nest, Drizzle, pg, better-auth
- `tsconfig.json` con paths para simular "packages" internos:

```json
{
  "paths": {
    "@app/database/*": ["packages/database/src/*"],
    "@app/core/*": ["src/core/*"],
    "@app/auth/*": ["src/auth/*"],
    "@app/common/*": ["src/common/*"]
  }
}
```

**Referencia:** `docs/Arbol-de-un-solo-backend-Nest.md`

---

### 1.2 - Estructura de carpetas principal

**Carpetas creadas:**

```txt
nucleous-framework/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── db/
│   │   └── client.ts
│   ├── auth/
│   ├── core/
│   ├── customers/
│   └── common/
└── packages/
    └── database/
        └── src/
            ├── index.ts
            └── schema/
                ├── index.ts
                ├── auth.ts
                └── core.ts
```

---

### 1.3 - Schema `auth.ts` (Better Auth)

**Archivo:** `packages/database/src/schema/auth.ts`

**Contenido:**
- Tablas: `auth_user`, `auth_session`, `auth_account`
- Solo tipos/Interfaces para Better Auth

---

## Fase 2: Schema Drizzle del CORE

### 2.1 - Schema `business` y `business_member`

**Archivo:** `packages/database/src/schema/core.ts` (sección 1)

**Contenido:**
- Tabla `business`
- Tabla `business_member`

**Referencia:** `01 - CORE.md` sección 1.2

---

### 2.2 - Schema `contact` y `contact_address`

**Archivo:** `packages/database/src/schema/core.ts` (sección 2)

**Contenido:**
- Tabla `contact`
- Tabla `contact_address`

**Referencia:** `05 - Entidades de CORE - contact y contact_address.md`

---

### 2.3 - Schema `user_profile`

**Archivo:** `packages/database/src/schema/core.ts` (sección 3)

**Contenido:**
- Tabla `user_profile`

**Referencia:** `01 - CORE.md` sección 1.4

---

### 2.4 - Schema `role` y `user_role`

**Archivo:** `packages/database/src/schema/core.ts` (sección 4)

**Contenido:**
- Tabla `role`
- Tabla `user_role`

**Referencia:** `01 - CORE.md` sección 1.5

---

### 2.5 - Schema `config_parameter`

**Archivo:** `packages/database/src/schema/core.ts` (sección 5)

**Contenido:**
- Tabla `config_parameter`

**Referencia:** `06 - Entidades de CORE - config_parameter.md`

---

### 2.6 - Schema `currency`, `country`, `state`

**Archivo:** `packages/database/src/schema/core.ts` (sección 6)

**Contenido:**
- Catálogos: `currency`, `country`, `state`

**Referencia:** `01 - CORE.md` sección 1.7

---

### 2.7 - Schema `activity`

**Archivo:** `packages/database/src/schema/core.ts` (sección 7)

**Contenido:**
- Tabla `activity`

**Referencia:** `07 - Entidades de CORE - activity.md`

---

### 2.8 - Schema `record_event`

**Archivo:** `packages/database/src/schema/core.ts` (sección 8)

**Contenido:**
- Tabla `record_event`

**Referencia:** `08 - Entidades de CORE - record_event.md`

---

## Fase 3: Capa de Dominio del CORE

### 3.1 - Entidad `Business` y repositorio

**Archivos a crear:**
- `src/core/domain/entities/business.entity.ts`
- `src/core/domain/repositories/business.repository.ts`

**Contenido:**
- Entidad `Business` con factory method `create()`
- Interfaz `BusinessRepository`

**Referencia:** `01 - CORE.md` sección 2.1 y 2.2

---

### 3.2 - Use case `CreateBusiness`

**Archivo:** `src/core/domain/use-cases/create-business.use-case.ts`

**Contenido:**
- Valida slug único
- Crea `Business` y retorna resultado

**Referencia:** `01 - CORE.md` sección 2.3

---

### 3.3 - Entidad `Contact` y repositorio

**Archivos a crear:**
- `src/core/domain/contacts/contact.entity.ts`
- `src/core/domain/contacts/contact.repository.ts`

**Contenido:**
- Entidad `Contact` con tipo `PERSON` | `COMPANY`
- Flags `isCustomer`, `isSupplier`, `isEmployee`
- Interfaz `ContactRepository`

**Referencia:** `05 - Entidades de CORE - contact y contact_address.md`

---

### 3.4 - Use case `CreateContact`

**Archivo:** `src/core/domain/contacts/use-cases/create-contact.use-case.ts`

**Contenido:**
- Factory `Contact.create()` neutro (sin asumir `isCustomer`)
- Valida email único por negocio
- **Nota:** La lógica de "crear cliente" (`isCustomer: true`) pertenece al módulo `customers`, no al core

**Referencia:** `05 - Entidades de CORE - contact y contact_address.md`, `09 - Ejemplo de integración para el módulo Clientes.md`

---

### 3.5 - Use case `ListContacts`

**Archivo:** `src/core/domain/contacts/use-cases/list-contacts.use-case.ts`

**Contenido:**
- Filtros: `search`, `isCustomer`, `isSupplier`, `isEmployee`
- Paginación: `page`, `pageSize`
- Retorna `{ data: Contact[], total: number }`

**Referencia:** `05 - Entidades de CORE - contact y contact_address.md`

---

### 3.6 - Entidad `Activity` y repositorio

**Archivos a crear:**
- `src/core/domain/activity/activity.entity.ts`
- `src/core/domain/activity/activity.repository.ts`

**Contenido:**
- Entidad `Activity`
- Métodos: `markDone()`, `cancel()`
- Estados: `PENDING`, `DONE`, `CANCELLED`
- Interfaz `ActivityRepository`

**Referencia:** `07 - Entidades de CORE - activity.md`

---

### 3.7 - Use cases de `Activity`

**Archivos a crear:**
- `src/core/domain/activity/use-cases/create-activity.use-case.ts`
- `src/core/domain/activity/use-cases/complete-activity.use-case.ts`

**Contenido:**
- `CreateActivityUseCase`
- `CompleteActivityUseCase`

**Referencia:** `07 - Entidades de CORE - activity.md`

---

### 3.8 - Entidad `RecordEvent` y repositorio

**Archivos a crear:**
- `src/core/domain/record-event/record-event.entity.ts`
- `src/core/domain/record-event/record-event.repository.ts`

**Contenido:**
- Entidad `RecordEvent`
- Tipos: `NOTE`, `SYSTEM`, `STATUS_CHANGE`
- Interfaz `RecordEventRepository`

**Referencia:** `08 - Entidades de CORE - record_event.md`

---

### 3.9 - Use case `AddRecordEvent`

**Archivo:** `src/core/domain/record-event/use-cases/add-record-event.use-case.ts`

**Contenido:**
- Crea eventos ligados a cualquier registro
- Soporta `userId: null` para eventos de sistema

**Referencia:** `08 - Entidades de CORE - record_event.md`

---

### 3.10 - Entidad `Role` y repositorio

**Archivos a crear:**
- `src/core/domain/roles/role.entity.ts`
- `src/core/domain/roles/role.repository.ts`

**Contenido:**
- Entidad `Role`
- Interfaz `RoleRepository`

**Referencia:** `01 - CORE.md` sección 2

---

### 3.11 - Entidad `UserProfile` y repositorio

**Archivos a crear:**
- `src/core/domain/user-profile/user-profile.entity.ts`
- `src/core/domain/user-profile/user-profile.repository.ts`

**Contenido:**
- Entidad `UserProfile`
- Tipos de usuario: `INTERNAL`, `CUSTOMER`, `PUBLIC`
- Interfaz `UserProfileRepository`

**Referencia:** `01 - CORE.md` sección 1.4 y 1.6

---

### 3.12 - Entidad `ConfigParameter` y repositorio

**Archivos a crear:**
- `src/core/domain/config-parameter/config-parameter.entity.ts`
- `src/core/domain/config-parameter/config-parameter.repository.ts`

**Contenido:**
- Entidad `ConfigParameter`
- Métodos helpers: `getValue()`, `setValue()`
- Interfaz `ConfigParameterRepository`

**Referencia:** `06 - Entidades de CORE - config_parameter.md`

---

### 3.13 - Use cases de `ConfigParameter`

**Archivos a crear:**
- `src/core/domain/config-parameter/use-cases/get-config-parameter.use-case.ts`
- `src/core/domain/config-parameter/use-cases/set-config-parameter.use-case.ts`

**Contenido:**
- `GetConfigParameterUseCase` - Obtiene valor por key (global o por business)
- `SetConfigParameterUseCase` - Crea o actualiza un parámetro
- Soporta valores JSON stringificados

**Referencia:** `06 - Entidades de CORE - config_parameter.md`

---

## Fase 4: Capa de Infraestructura del CORE

### 4.1 - Cliente Drizzle

**Archivo:** `src/db/client.ts`

**Contenido:**
- Pool de PostgreSQL
- Instancia Drizzle con schema de `@app/database`

**Referencia:** `01 - CORE.md` sección 3.1

---

### 4.2 - Repositorio `DrizzleBusinessRepository`

**Archivo:** `src/core/infrastructure/persistence/drizzle-business.repository.ts`

**Contenido:**
- Implementa `BusinessRepository`
- Métodos: `create`, `findById`, `findBySlug`

**Referencia:** `01 - CORE.md` sección 3.2

---

### 4.3 - Repositorio `DrizzleContactRepository`

**Archivo:** `src/core/infrastructure/persistence/drizzle-contact.repository.ts`

**Contenido:**
- Implementa `ContactRepository`
- Métodos: `create`, `findById`, `listByBusiness`
- Filtros y paginación

**Referencia:** `05 - Entidades de CORE - contact y contact_address.md`

---

### 4.4 - Repositorio `DrizzleActivityRepository`

**Archivo:** `src/core/infrastructure/persistence/drizzle-activity.repository.ts`

**Contenido:**
- Implementa `ActivityRepository`
- Métodos: `create`, `findById`, `save`, `listForRecord`, `listForUser`

**Referencia:** `07 - Entidades de CORE - activity.md`

---

### 4.5 - Repositorio `DrizzleRecordEventRepository`

**Archivo:** `src/core/infrastructure/persistence/drizzle-record-event.repository.ts`

**Contenido:**
- Implementa `RecordEventRepository`
- Métodos: `create`, `listForRecord`

**Referencia:** `08 - Entidades de CORE - record_event.md`

---

### 4.6 - Repositorio `DrizzleRoleRepository`

**Archivo:** `src/core/infrastructure/persistence/drizzle-role.repository.ts`

**Contenido:**
- Implementa `RoleRepository`

---

### 4.7 - Repositorio `DrizzleUserProfileRepository`

**Archivo:** `src/core/infrastructure/persistence/drizzle-user-profile.repository.ts`

**Contenido:**
- Implementa `UserProfileRepository`

---

### 4.8 - Repositorio `DrizzleConfigParameterRepository`

**Archivo:** `src/core/infrastructure/persistence/drizzle-config-parameter.repository.ts`

**Contenido:**
- Implementa `ConfigParameterRepository`
- Métodos: `findByKey`, `upsert`

**Referencia:** `06 - Entidades de CORE - config_parameter.md`

---

### 4.9 - Servicio `CurrentBusinessService`

**Archivo:** `src/core/application/current-business.service.ts`

**Contenido:**
- Resuelve `businessId` del contexto actual
- MVP: valor fijo o extraído del token

**Referencia:** `04 - Arbol de un solo backend Nest.md` sección 2.1

---

### 4.10 - Controller `BusinessController`

**Archivo:** `src/core/infrastructure/http/business.controller.ts`

**Endpoints:**
- `POST /core/business` - Crear negocio
- `GET /core/business/:id` - Obtener negocio

**Referencia:** `01 - CORE.md` sección 3.3

---

### 4.11 - Controller `ContactController`

**Archivo:** `src/core/infrastructure/http/contact.controller.ts`

**Endpoints:**
- `POST /core/contacts` - Crear contacto
- `GET /core/contacts` - Listar contactos (con filtros y paginación)

**Convenciones:** Ver sección 7.1 - debe soportar `page`, `pageSize`, `search`, `sortBy`, `sortOrder`

**Referencia:** `05 - Entidades de CORE - contact y contact_address.md`

---

### 4.12 - Controller `ActivityController`

**Archivo:** `src/core/infrastructure/http/activity.controller.ts`

**Endpoints:**
- `POST /core/activities` - Crear actividad
- `POST /core/activities/:id/complete` - Completar actividad
- `GET /core/activities/record/:table/:recordId` - Listar por registro
- `GET /core/activities/me` - Listar actividades del usuario actual

**Convenciones:** Ver sección 7.1 - debe soportar `page`, `pageSize`, `from_date`, `to_date`, `search`

**Referencia:** `07 - Entidades de CORE - activity.md`

---

### 4.12 - Controller `RecordEventController`

**Archivo:** `src/core/infrastructure/http/record-event.controller.ts`

**Endpoints:**
- `POST /core/events/:table/:id` - Añadir evento a un registro
- `GET /core/events/:table/:id` - Listar eventos de un registro

**Convenciones:** Ver sección 7.1 - debe soportar `page`, `pageSize`

**Referencia:** `08 - Entidades de CORE - record_event.md`

---

### 4.13 - Controller `ConfigController`

**Archivo:** `src/core/infrastructure/http/config.controller.ts`

**Endpoints:**
- `GET /core/config/:key` - Obtener valor de un parámetro
- `POST /core/config` - Crear/actualizar parámetro
- `GET /core/config` - Listar parámetros (filtro por business o global)

**Referencia:** `06 - Entidades de CORE - config_parameter.md`

---

## Fase 5: Integración con Better Auth

### 5.1 - Configuración de Better Auth

**Archivos a crear:**
- `src/auth/better-auth.config.ts`
- `src/auth/auth.module.ts`

**Contenido:**
- Configuración del adaptador PostgreSQL
- Modelo de usuario extendido

**Referencia:** `01 - CORE.md` sección 1.1

---

### 5.2 - Guard y decorators de sesión

**Archivos a crear:**
- `src/auth/auth.guard.ts`
- `src/auth/session.decorator.ts`

**Contenido:**
- `@Session()` decorator para obtener `userId`
- `AuthGuard` global

**Referencia:** `04 - Arbol de un solo backend Nest.md` sección 1

---

## Fase 6: Módulo CORE y App Module

### 6.1 - CoreModule

**Archivo:** `src/core/core.module.ts`

**Contenido:**
- Importa todos los controllers del core
- Exporta `CurrentBusinessService`

**Referencia:** `04 - Arbol de un solo backend Nest.md` sección 2.1

---

### 6.2 - AppModule

**Archivo:** `src/app.module.ts`

**Contenido:**
- Importa: `CoreModule`, `AuthModule`, `DatabaseModule`
- Configuración básica de Nest

---

### 6.3 - Main.ts

**Archivo:** `src/main.ts`

**Contenido:**
- Bootstrap de la aplicación Nest
- Validación de pipes
- Swagger opcional

---

## Fase 7: Convenciones y helpers

### 7.1 - Convenciones de fechas y filtros

**Archivo:** `src/common/docs/conventions.md` (o dentro de CORE.md)

**Contenido:**
- Query params universales: `page`, `pageSize`, `from_date`, `to_date`, `search`, `sortBy`, `sortOrder`
- Traducción de `date_range` (`TODAY`, `THIS_WEEK`, etc.)

**Referencia:** `01 - CORE.md` sección 1.11

---

### 7.2 - Helper de auditoría en repos

**Archivo:** `src/common/helpers/audit.helper.ts`

**Contenido:**
- Función para asignar `created_at`, `created_by`, `updated_at`, `updated_by`
- Uso en todos los repositorios Drizzle

**Referencia:** `Auditoria.md`

---

## Orden recomendado de trabajo

1. **Fase 1** (1.1 → 1.2) - Estructura del monorepo
2. **Fase 2** (2.1 → 2.8) - Schema Drizzle
3. **Fase 4.1** - Cliente Drizzle
4. **Fase 5** (5.1 → 5.2) - Better Auth
5. **Fase 3** (3.1 → 3.13) - Dominio
6. **Fase 4** (4.2 → 4.13) - Infraestructura
7. **Fase 6** (6.1 → 6.3) - Módulos
8. **Fase 7** - Convenciones

---

## Notas

- Cada paso debe ser un commit independiente
- El dominio **nunca** importa Drizzle ni NestJS
- La infraestructura solo conoce Drizzle (persistence) y Nest (HTTP)
- Todos los endpoints de negocio reciben `businessId` vía `CurrentBusinessService`
- Los controllers de listado deben seguir las convenciones de filtros (sección 7.1)
