# Dominio del Core

## Entidades

Todas las entidades en la capa de dominio son **clases TypeScript puras** con:
- Campo privado `props` para encapsulamiento
- Métodos de fábrica (ej. `Business.create()`)
- Getters para acceso de solo lectura
- Sin dependencias de frameworks externos

### Entidad Business

Representa un negocio/tenant en el sistema.

```typescript
// Ubicación: src/core/domain/entities/business.entity.ts

interface BusinessProps {
  id: string;
  name: string;
  legalName: string | null;
  slug: string;
  countryCode: string | null;
  timezone: string | null;
  currencyCode: string | null;
  publicName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

class Business {
  private props: BusinessProps;

  static create(params: { name: string; slug: string; ... }): Business
  static fromProps(props: BusinessProps): Business

  get id(): string
  get name(): string
  get slug(): string
  // ... otros getters
}
```

### Entidad Contact

Representa un contacto (persona o empresa) dentro de un negocio.

```typescript
// Ubicación: src/core/domain/contacts/contact.entity.ts

type ContactType = 'PERSON' | 'COMPANY';

interface ContactProps {
  id: string;
  businessId: string;
  type: ContactType;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  isEmployee: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}

class Contact {
  static create(params: { businessId: string; name: string; type: ContactType; ... }): Contact
  static fromProps(props: ContactProps): Contact

  get id(): string
  get businessId(): string
  get name(): string
  // ... otros getters
}
```

### Entidad Activity

Representa una tarea/actividad asociada a registros.

```typescript
// Ubicación: src/core/domain/activity/activity.entity.ts

type ActivityStatus = 'PENDING' | 'DONE' | 'CANCELLED';

interface ActivityProps {
  id: string;
  businessId: string;
  userId: string | null;
  relatedTable: string;
  relatedId: string;
  type: string;
  status: ActivityStatus;
  title: string;
  note: string | null;
  dueDate: Date | null;
  isPinned: boolean;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

class Activity {
  static create(params: { ... }): Activity
  static fromProps(props: ActivityProps): Activity

  markDone(): void
  cancel(): void
}
```

### Entidad RecordEvent

Pista de auditoría para cambios en registros.

```typescript
// Ubicación: src/core/domain/record-event/record-event.entity.ts

type RecordEventType = 'NOTE' | 'SYSTEM' | 'STATUS_CHANGE';

interface RecordEventProps {
  id: string;
  businessId: string;
  userId: string | null;  // null para eventos de sistema
  relatedTable: string;
  relatedId: string;
  type: RecordEventType;
  message: string;
  createdAt: Date;
}
```

### Entidad Role

Roles de negocio para usuarios.

```typescript
// Ubicación: src/core/domain/roles/role.entity.ts

interface RoleProps {
  id: string;
  businessId: string | null;  // null para roles globales
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
}
```

### Entidad UserProfile

Perfil de usuario vinculado al usuario de Better Auth.

```typescript
// Ubicación: src/core/domain/user-profile/user-profile.entity.ts

type UserType = 'INTERNAL' | 'CUSTOMER' | 'PUBLIC';

interface UserProfileProps {
  id: string;
  userId: string;
  primaryBusinessId: string | null;
  contactId: string | null;
  displayName: string;
  avatarUrl: string | null;
  locale: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date | null;
}
```

### Entidad ConfigParameter

Almacenamiento de configuración clave-valor.

```typescript
// Ubicación: src/core/domain/config-parameter/config-parameter.entity.ts

interface ConfigParameterProps {
  id: string;
  key: string;
  value: string;  // JSON stringified para valores complejos
  businessId: string | null;  // null para parámetros globales
  createdAt: Date;
  createdBy: string | null;
}
```

## Interfaces de Repositorio

Cada entidad tiene una interfaz de repositorio correspondiente. Las implementaciones viven en `infrastructure/persistence/`.

### Patrón

```typescript
// Ubicación: src/core/domain/repositories/business.repository.ts

export const BUSINESS_REPOSITORY = Symbol('BusinessRepository');

export interface BusinessRepository {
  create(business: Business): Promise<Business>;
  findById(id: string): Promise<Business | null>;
  findBySlug(slug: string): Promise<Business | null>;
}
```

### Interfaces Disponibles

| Interfaz | Ubicación |
|-----------|----------|
| `BusinessRepository` | `src/core/domain/repositories/business.repository.ts` |
| `ContactRepository` | `src/core/domain/contacts/contact.repository.ts` |
| `ActivityRepository` | `src/core/domain/activity/activity.repository.ts` |
| `RecordEventRepository` | `src/core/domain/record-event/record-event.repository.ts` |
| `RoleRepository` | `src/core/domain/roles/role.repository.ts` |
| `UserProfileRepository` | `src/core/domain/user-profile/user-profile.repository.ts` |
| `ConfigParameterRepository` | `src/core/domain/config-parameter/config-parameter.repository.ts` |

## Reglas del Dominio

1. **Sin imports externos en dominio**: Entidades y casos de uso no pueden importar Drizzle, NestJS, ni ningún framework.
2. **Fábricas para creación**: Usar `Entity.create()` en lugar de constructores.
3. **Props inmutables**: Entidades exponen datos a través de getters, no acceso directo a propiedades.
4. **Patrón repositorio**: Dominio solo define interfaces; las implementaciones están en infraestructura.

## Agregar una Nueva Entidad

Al agregar una nueva entidad (ej. `Product` para inventario):

1. Crear `src/core/domain/product/product.entity.ts` con interfaz de props y clase
2. Crear `src/core/domain/product/product.repository.ts` con interfaz de repositorio
3. Crear `src/core/domain/product/use-cases/` para operaciones de negocio
4. Implementar en `src/core/infrastructure/persistence/drizzle-product.repository.ts`
5. Agregar controlador en `src/core/infrastructure/http/product.controller.ts`
6. Conectar en `CoreModule` con tokens DI