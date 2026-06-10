# Cómo se Integrarían Nuevas Características

## Visión General

Nucleous Framework está diseñado para que nuevos módulos se integren de forma **independiente pero integrable**. El modelo permite activar o desactivar módulos sin tocar el código base.

```
nucleous-framework/
├── apps/
│   └── api-default/           # Aplicación compositora
│       ├── main.ts            # Bootstrap (carga .env, valida módulos)
│       ├── app.module.ts      # Importa módulos condicionalmente
│       └── module-validator.ts # Lista de módulos válidos
│
├── src/
│   ├── core/                  # Base (SIEMPRE presente)
│   ├── auth/                  # Auth (SIEMPRE presente)
│   ├── ai/                    # Módulo AI (opcional, controlado por ENABLED_MODULES)
│   ├── customers/             # Futuro: módulo de clientes
│   ├── inventory/             # Futuro: módulo de inventario
│   └── ecommerce/             # Futuro: módulo de comercio
│
└── packages/
    └── database/
        └── src/
            ├── client.ts     # Cliente Drizzle
            └── schema/        # Tablas compartidas
```

## El Modelo de Aplicación

En lugar de que `src/app.module.ts` importe todos los módulos, existe `apps/api-default/` como compositor:

```typescript
// apps/api-default/app.module.ts

const imports: Type<any>[] = [
  DatabaseModule,
  AuthModule,
  CoreModule,
];

if (enabledModules.includes('AI')) {
  imports.push(AiModule);
}
```

Y `ENABLED_MODULES` en `.env` controla qué módulos se cargan:

```env
# .env - Módulos activos
ENABLED_MODULES=AI

# .env - Múltiples módulos
ENABLED_MODULES=AI,CUSTOMERS,INVENTORY
```

**El beneficio**: Un alumno puede empezar con solo `core + auth` y agregar módulos según sus necesidades.

---

## Cómo Conectar Módulos entre Sí

### Core (Base Obligatoria)

- **Propósito**: Usuarios, roles, auditoría, `businessId` para multi-tenant.
- `CurrentBusinessService` resuelve el `businessId` actual para cualquier módulo.
- **Nunca depende de otros módulos**.

### Módulos Transversales (Opcionales)

| Módulo | Descripción | Depende de |
|--------|-------------|------------|
| `ai` | Integración con LLMs | Core, Auth |
| `mail` | Envío de emails | Core, Auth |
| `storage` | Almacenamiento archivos | Core, Auth |

### Módulos de Negocio (Opcionales)

| Módulo | Descripción | Depende de |
|--------|-------------|------------|
| `customers` | Gestión de clientes | Core, Auth |
| `inventory` | Gestión de inventario | Core, Auth |
| `ecommerce` | Catálogo y ventas | Core, Auth, Inventory |

**Regla**: Los módulos de negocio pueden conocer a otros módulos de negocio (ej: ecommerce → inventory), pero nunca al revés.

---

## Patrón Domain/Infrastructure

Cada módulo sigue la misma estructura:

```
src/{module-name}/
├── domain/                      # Lógica pura (sin NestJS, sin Drizzle)
│   ├── entities/               # Entidades del negocio
│   ├── repositories/           # Interfaces (contratos)
│   └── use-cases/             # Casos de uso
├── infrastructure/
│   ├── persistence/            # Implementaciones Drizzle
│   └── http/                  # Controllers NestJS
└── {module-name}.module.ts    # Wiring del módulo
```

### Ejemplo: Módulo Customers

**Dominio** (puro, sin dependencias externas):
```typescript
// src/customers/domain/entities/customer.entity.ts

export class Customer {
  private constructor(private props: CustomerProps) {}

  static create(params: { businessId: string; name: string; email?: string }): Customer {
    return new Customer({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      name: params.name,
      email: params.email ?? null,
      isActive: true,
      createdAt: new Date(),
    });
  }
}
```

**Repositorio** (interfaz):
```typescript
// src/customers/domain/repositories/customer.repository.ts

export const CUSTOMER_REPOSITORY = Symbol('CustomerRepository');

export interface CustomerRepository {
  create(customer: Customer): Promise<Customer>;
  findById(id: string, businessId: string): Promise<Customer | null>;
  listByBusiness(businessId: string): Promise<Customer[]>;
}
```

**Infraestructura** (implementación Drizzle):
```typescript
// src/customers/infrastructure/persistence/drizzle-customer.repository.ts

import { db } from '#app/database/client';
import { customer } from '#app/database/schema/customers';

@Injectable()
export class DrizzleCustomerRepository implements CustomerRepository {
  async create(entity: Customer): Promise<Customer> {
    await db.insert(customer).values({ /* ... */ });
    return entity;
  }
}
```

---

## Schema Drizzle Compartido

Todas las tablas viven en `packages/database/src/schema/`:

```typescript
// packages/database/src/schema/customers.ts

import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { business } from './core';

export const customer = pgTable('customer', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => business.id).notNull(),
  name: text('name').notNull(),
  email: text('email'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull(),
  createdBy: uuid('created_by'),
});
```

**Un solo cliente Drizzle** (`#app/database/client`) conecta a todas las tablas.

---

## Módulos Independientes pero Integrables

La clave del modelo:

### 1. Puedo correr solo core + customers
Sin inventario, sin ecommerce. Solo agrego `CustomersModule` si lo necesito.

### 2. Puedo añadir inventario después
Sin tocar customers ni ecommerce. Solo agrego el módulo y lo habilito en `ENABLED_MODULES`.

### 3. Puedo替换 módulos sin romper otros
Cada módulo conoce solo las interfaces de los otros, no sus implementaciones.

```typescript
// Si ecommerce necesita inventory, solo importa la interfaz:
import { INVENTORY_PRODUCT_REPOSITORY } from '../../inventory/domain/repositories/inventory-product.repository';
```

---

## Flujo de Desarrollo de un Nuevo Módulo

### Paso 1: Crear estructura

```
src/customers/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── use-cases/
├── infrastructure/
│   ├── persistence/
│   └── http/
└── customers.module.ts
```

### Paso 2: Implementar dominio

- Entidades puras en `domain/entities/`
- Interfaces de repositorio en `domain/repositories/`
- Casos de uso en `domain/use-cases/`

### Paso 3: Implementar infraestructura

- Repositorios Drizzle en `infrastructure/persistence/`
- Controllers en `infrastructure/http/`

### Paso 4: Crear el módulo

```typescript
// src/customers/customers.module.ts

@Module({
  controllers: [CustomerController],
  providers: [
    { provide: CUSTOMER_REPOSITORY, useClass: DrizzleCustomerRepository },
    CreateCustomerUseCase,
    ListCustomersUseCase,
  ],
})
export class CustomersModule {}
```

### Paso 5: Integrar en la app

1. **Agregar a VALID_MODULES**:
```typescript
// apps/api-default/module-validator.ts
export const VALID_MODULES = ['AI', 'CUSTOMERS'] as const;
```

2. **Importar condicionalmente**:
```typescript
// apps/api-default/app.module.ts
if (enabledModules.includes('CUSTOMERS')) {
  imports.push(CustomersModule);
}
```

3. **Habilitar en .env**:
```env
ENABLED_MODULES=AI,CUSTOMERS
```

---

## Resumen Visual

```
Módulos que puedes activar/desactivar:

┌─────────────────────────────────────────────┐
│         apps/api-default/                   │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │ module-validator│  │   app.module    │  │
│  └────────┬────────┘  └────────┬────────┘  │
│           │                       │          │
│           ▼                       ▼          │
│  ┌─────────────────────────────────────────┐│
│  │         ENABLED_MODULES=AI,CUSTOMERS   ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────┐   ┌───────────┐   ┌───────────┐
│   AI    │   │ CUSTOMERS  │   │INVENTORY  │
│(optativo│   │ (optativo)  │   │ (futuro)   │
└─────────┘   └───────────┘   └───────────┘
```

Cada módulo es **opcional**, **independiente** y **reutilizable**.