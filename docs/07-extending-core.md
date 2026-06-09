# Extendiendo el Core

## Visión General

El **Core** de Nucleous Framework provee la base de usuarios, roles, auditoría y multi-tenant (`businessId`). Los módulos adicionales se "apoyan" en el core, reutilizando sus conceptos sin acoplamiento directo.

```
Core (base)
├── Auth (Better Auth)
├── Business
├── Contact
├── Activity
└── RecordEvent

Módulos adicionales (se integran sobre el core)
├── Customers
├── Inventory
└── Ecommerce
```

## ¿Qué Significa "Usar el Core como Base"?

El core provee:
- **Usuarios**: Autenticación via Better Auth (`userId`)
- **Roles/Permisos**: Sistema básico de roles
- **Auditoría**: Campos `createdBy`, `updatedBy` en todas las entidades
- **Multi-tenant**: `businessId` para aislar datos por negocio
- **Servicios transversales**: `CurrentBusinessService` para resolver contexto

Los módulos nuevos reutilizan estos conceptos:
- FKs a `businessId` para aislamiento
- `userId` para auditoría de cambios
- Entidades del core como `Contact` para relaciones

## Patrón Domain/Infrastructure

Cada módulo sigue la misma estructura:

```
src/<module>/
├── domain/
│   ├── entities/
│   │   └── module-entity.entity.ts
│   ├── repositories/
│   │   └── module-entity.repository.ts
│   └── use-cases/
│       ├── create-entity.use-case.ts
│       └── list-entities.use-case.ts
├── infrastructure/
│   ├── persistence/
│   │   └── drizzle-module-entity.repository.ts
│   └── http/
│       └── module-entity.controller.ts
└── <module>.module.ts
```

## Reglas de Oro

1. **El dominio nunca importa Drizzle ni NestJS**
2. **La infraestructura solo conoce Drizzle (persistence) y Nest (HTTP)**
3. **Los módulos se conectan a través de interfaces, no implementaciones**
4. **Un módulo puede ser opcional (importar o no en AppModule)**

## Ejemplo: Añadir Módulo Customers

### 1. Definir Entidades del Dominio

```typescript
// src/customers/domain/entities/customer.entity.ts

export interface CustomerProps {
  id: string;
  businessId: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export class Customer {
  private props: CustomerProps;

  static create(params: {
    businessId: string;
    name: string;
    email?: string;
    phone?: string;
    taxId?: string;
  }): Customer {
    return new Customer({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      name: params.name,
      email: params.email ?? null,
      phone: params.phone ?? null,
      taxId: params.taxId ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      createdBy: null,
      updatedBy: null,
    });
  }

  static fromProps(props: CustomerProps): Customer {
    return new Customer(props);
  }

  // Getters...
}
```

### 2. Definir Interfaz de Repositorio

```typescript
// src/customers/domain/repositories/customer.repository.ts

export const CUSTOMER_REPOSITORY = Symbol('CustomerRepository');

export interface CustomerRepository {
  create(customer: Customer): Promise<Customer>;
  findById(id: string, businessId: string): Promise<Customer | null>;
  listByBusiness(businessId: string, options?: ListOptions): Promise<{ data: Customer[]; total: number }>;
}
```

### 3. Crear Casos de Uso

```typescript
// src/customers/domain/use-cases/create-customer.use-case.ts

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: CustomerRepository,
  ) {}

  async execute(input: CreateCustomerInput): Promise<CreateCustomerOutput> {
    const customer = Customer.create({
      businessId: input.businessId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      taxId: input.taxId,
    });

    const saved = await this.customerRepo.create(customer);
    return { customer: saved };
  }
}
```

### 4. Implementar en Infraestructura (Drizzle)

```typescript
// src/customers/infrastructure/persistence/drizzle-customer.repository.ts

import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { customer } from '#app/database/schema/customers.js';
import { Customer, type CustomerProps } from '../../domain/entities/customer.entity.js';
import type { CustomerRepository } from '../../domain/repositories/customer.repository.js';

@Injectable()
export class DrizzleCustomerRepository implements CustomerRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: Customer): Promise<Customer> {
    await this._db.insert(customer).values({
      id: entity.id,
      businessId: entity.businessId,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      taxId: entity.taxId,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    });
    return entity;
  }

  async findById(id: string, businessId: string): Promise<Customer | null> {
    const rows = await this._db
      .select()
      .from(customer)
      .where(and(eq(customer.id, id), eq(customer.businessId, businessId)))
      .limit(1);
    return rows[0] ? this.mapToEntity(rows[0]) : null;
  }

  private mapToEntity(row: typeof customer.$inferSelect): Customer {
    const props: CustomerProps = {
      id: row.id,
      businessId: row.businessId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      taxId: row.taxId,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
    };
    return Customer.fromProps(props);
  }
}
```

### 5. Crear Controlador HTTP

```typescript
// src/customers/infrastructure/http/customer.controller.ts

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly currentBusinessService: CurrentBusinessService,
  ) {}

  @Post()
  async create(@Body() body: CreateCustomerDto) {
    const businessId = this.currentBusinessService.getBusinessId();
    const result = await this.createCustomerUseCase.execute({
      businessId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      taxId: body.taxId,
    });
    return { id: result.customer.id, name: result.customer.name };
  }

  @Get()
  async list(@Query() query: ListCustomersQuery) {
    const businessId = this.currentBusinessService.getBusinessId();
    const result = await this.listCustomersUseCase.execute({
      businessId,
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
    });
    return result;
  }
}
```

### 6. Crear el Módulo

```typescript
// src/customers/customers.module.ts

import { Module } from '@nestjs/common';
import { CustomerController } from './infrastructure/http/customer.controller.js';
import { DrizzleCustomerRepository } from './infrastructure/persistence/drizzle-customer.repository.js';
import { CreateCustomerUseCase } from './domain/use-cases/create-customer.use-case.js';
import { ListCustomersUseCase } from './domain/use-cases/list-customers.use-case.js';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository.js';

@Module({
  controllers: [CustomerController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: DrizzleCustomerRepository,
    },
    CreateCustomerUseCase,
    ListCustomersUseCase,
  ],
})
export class CustomersModule {}
```

### 7. Importar en AppModule

```typescript
// src/app.module.ts

import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './core/infrastructure/database/database.module.js';
import { CustomersModule } from './customers/customers.module.js';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CoreModule,
    CustomersModule,  // ← Módulo opcional
  ],
})
export class AppModule {}
```

## Ejemplo: Añadir Módulo Inventory

El módulo de inventario es independiente de customers; solo usa `businessId` y `userId` del core.

### Entidades

- `InventoryProduct`: Producto en inventario
- `InventoryLocation`: Ubicación/almacén
- `InventoryStock`: Stock por ubicación
- `InventoryMove`: Movimiento de inventario

### Uso de businessId y userId

```typescript
// En InventoryMove
interface InventoryMoveProps {
  id: string;
  businessId: string;      // Del core (aislamiento)
  productId: string;       // FK a InventoryProduct
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  type: 'IN' | 'OUT' | 'TRANSFER';
  userId: string;          // Del core (auditoría)
  createdAt: Date;
}
```

### Flujo de ConfirmMove

```
1. HTTP POST /inventory/moves/:id/confirm
2. @Session('userId') → userId (de Better Auth)
3. CurrentBusinessService.getBusinessId() → businessId
4. ConfirmMoveUseCase.execute({ moveId, businessId, userId })
5. Validar stock y actualizar InventoryStock
6. Drizzle actualiza con created_by = userId
```

## Schema Drizzle para Módulos

```typescript
// packages/database/src/schema/customers.ts

import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { business } from './core.js';

export const customer = pgTable('customer', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id')
    .references(() => business.id)
    .notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  taxId: text('tax_id'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});
```

## Módulos Opcionales

Puedes hacer que un módulo sea condicional:

```typescript
// src/app.module.ts

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CoreModule,
    ...(process.env.ENABLE_CUSTOMERS === 'true' ? [CustomersModule] : []),
    ...(process.env.ENABLE_INVENTORY === 'true' ? [InventoryModule] : []),
  ],
})
export class AppModule {}
```

## Resumen: Pasos para Crear un Módulo

1. **Dominio**:
   - Crear `domain/entities/<entity>.entity.ts`
   - Crear `domain/repositories/<entity>.repository.ts` con interfaz
   - Crear `domain/use-cases/` con casos de uso

2. **Infraestructura**:
   - Crear `infrastructure/persistence/drizzle-<entity>.repository.ts`
   - Crear `infrastructure/http/<entity>.controller.ts`

3. **Módulo**:
   - Crear `<module>.module.ts`
   - Registrar providers y controllers

4. **Integración**:
   - Importar en `AppModule`
   - Añadir schema Drizzle en `packages/database/src/schema/`

5. **Convenciones**:
   - Usar `businessId` para aislamiento
   - Usar `userId` para auditoría
   - Implementar pagination y filtros estándar