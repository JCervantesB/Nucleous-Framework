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
├── AI (transversal, opcional)
├── Customers (negocio, opcional)
├── Inventory (negocio, opcional)
└── Ecommerce (negocio, opcional)
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
4. **Un módulo puede ser opcional (controlado por ENABLED_MODULES)**

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
import { db } from '#app/database/client';
import { customer } from '#app/database/schema/customers';
import { Customer, type CustomerProps } from '../../domain/entities/customer.entity';
import type { CustomerRepository } from '../../domain/repositories/customer.repository';

@Injectable()
export class DrizzleCustomerRepository implements CustomerRepository {
  async create(entity: Customer): Promise<Customer> {
    await db.insert(customer).values({
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
    const rows = await db
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
import { CustomerController } from './infrastructure/http/customer.controller';
import { DrizzleCustomerRepository } from './infrastructure/persistence/drizzle-customer.repository';
import { CreateCustomerUseCase } from './domain/use-cases/create-customer.use-case';
import { ListCustomersUseCase } from './domain/use-cases/list-customers.use-case';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository';

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

### 7. Integrar en AppModule (apps/api-default/)

```typescript
// apps/api-default/app.module.ts

import { Module, type Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { CustomersModule } from '../../src/customers/customers.module';
import { validateEnabledModules, getEnabledModules } from './module-validator';

validateEnabledModules();
const enabledModules = getEnabledModules();

const imports: Type<any>[] = [
  DatabaseModule,
  AuthModule,
  CoreModule,
];

if (enabledModules.includes('CUSTOMERS')) {
  imports.push(CustomersModule);
}

@Module({ imports })
export class AppModule {}
```

### 8. Agregar a VALID_MODULES

```typescript
// apps/api-default/module-validator.ts

export const VALID_MODULES = [
  'AI',
  'CUSTOMERS',  // ← Agregar cuando se implemente
] as const;
```

### 9. Habilitar en .env

```env
ENABLED_MODULES=AI,CUSTOMERS
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
   - Agregar a `VALID_MODULES` en `apps/api-default/module-validator.ts`
   - Importar condicionalmente en `apps/api-default/app.module.ts`
   - Añadir schema Drizzle en `packages/database/src/schema/`
   - Habilitar con `ENABLED_MODULES=MODULO` en `.env`

5. **Convenciones**:
   - Usar `businessId` para aislamiento
   - Usar `userId` para auditoría
   - Implementar pagination y filtros estándar

## Módulos Existentes como Referencia

- **AI Module** (`src/ai/`): Módulo transversal con domain ligero, ver `docs/AiModule/`
- **Core** (`src/core/`): Módulo base con domain rico, ver `01-core-overview.md`