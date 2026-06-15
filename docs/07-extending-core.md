# Extendiendo el Core

## Visión general

El **Core** de Nucleous Framework provee la base común sobre la que se apoyan todos los módulos:

- **Usuarios**: autenticación via Better Auth (`userId`).
- **Multi-tenant**: aislamiento por negocio usando `businessId`.
- **Roles y permisos**: sistema básico de roles por negocio.
- **Auditoría**: campos estándar `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- **Servicios transversales**: por ejemplo `CurrentBusinessService` para resolver el `businessId` actual.

Estructura conceptual:

```txt
Core (base)
├── Auth (Better Auth)
├── Business
├── Contact
├── Activity
└── RecordEvent

Módulos adicionales (se apoyan en el core)
├── AI         (transversal, opcional)
├── Customers  (negocio, opcional)
├── Inventory  (negocio, opcional)
└── Ecommerce  (negocio, opcional)
```

“Usar el Core como base” significa que cualquier módulo nuevo:

- Usa `businessId` para aislar sus datos.
- Usa `userId` para saber quién creó o modificó algo.
- Puede relacionarse con entidades del core (por ejemplo `Contact`, `Business`) sin duplicarlas.

---

## Patrón de módulo (domain / application / infrastructure)

Todos los módulos siguen el mismo patrón que el core, AI, Email y Storage:

```txt
src/<module>/
├── domain/                 # Reglas de negocio (TypeScript puro)
│   ├── entities/
│   ├── repositories/
│   └── use-cases/
├── infrastructure/         # Adaptadores (Drizzle, HTTP, SDKs, etc.)
│   ├── persistence/
│   └── http/
└── <module>.module.ts      # Wiring NestJS del módulo
```

**Reglas de oro:**

1. El **dominio nunca importa** Drizzle ni NestJS.
2. La **infraestructura** es quien conoce Drizzle (persistence) y NestJS (HTTP, DI).
3. Los módulos se conectan a través de **interfaces**, no de implementaciones concretas.
4. Un módulo puede ser **opcional**, controlado por `ENABLED_MODULES` y el `module-registry`.

---

## Ejemplo completo: módulo Customers

### 1. Entidad de dominio

La entidad respeta las convenciones del core: `businessId` y campos de auditoría.

```ts
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
  private constructor(private props: CustomerProps) {}

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

### 2. Repositorio de dominio

Solo define el contrato; no sabe de Drizzle ni de la base de datos.

```ts
// src/customers/domain/repositories/customer.repository.ts

export const CUSTOMER_REPOSITORY = Symbol('CustomerRepository');

export interface CustomerRepository {
  create(customer: Customer): Promise<Customer>;
  findById(id: string, businessId: string): Promise<Customer | null>;
  listByBusiness(
    businessId: string,
    options?: ListOptions,
  ): Promise<{ data: Customer[]; total: number }>;
}
```

### 3. Caso de uso

El caso de uso recibe `businessId` y datos, crea la entidad y delega en el repositorio.

```ts
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

### 4. Infraestructura: repositorio Drizzle

Aquí se implementa la interfaz usando el schema compartido de `packages/database`.

```ts
// src/customers/infrastructure/persistence/drizzle-customer.repository.ts

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

    return rows ? this.mapToEntity(rows) : null;
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

### 5. Controlador HTTP

El controlador traduce HTTP ↔ casos de uso. No decide `businessId`: lo obtiene del contexto (por ejemplo un servicio o decorator).

```ts
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

    return this.listCustomersUseCase.execute({
      businessId,
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
    });
  }
}
```

### 6. Módulo Customers

Agrupa controller, use cases y repositorios en un módulo NestJS.

```ts
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

---

## Integración con el sistema de módulos

Con el registro centralizado (`apps/api-default/module-registry.ts`), añadir un módulo nuevo es cuestión de una línea.

```ts
// apps/api-default/module-registry.ts

import { AiModule } from '../../src/ai/ai.module';
import { EmailModule } from '../../src/email/email.module';
import { StorageModule } from '../../src/storage/storage.module';
import { CustomersModule } from '../../src/customers/customers.module';

export interface ModuleRegistryEntry {
  name: string;
  module: Type;
}

const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  { name: 'AI', module: AiModule },
  { name: 'EMAIL', module: EmailModule },
  { name: 'STORAGE', module: StorageModule },
  { name: 'CUSTOMERS', module: CustomersModule }, // ← nuevo
];

export const VALID_MODULES = MODULE_REGISTRY.map(m => m.name);

export function getModulesToLoad(envModules: string[]): Type[] {
  return MODULE_REGISTRY
    .filter(entry => envModules.includes(entry.name))
    .map(entry => entry.module);
}

export function validateModules(modules: string[]): string[] {
  const invalid = modules.filter(m => !VALID_MODULES.includes(m));
  if (invalid.length > 0) {
    throw new Error(
      `Módulos inválidos: ${invalid.join(', ')}. Válidos: ${VALID_MODULES.join(', ')}`,
    );
  }
  return modules;
}
```

En el `AppModule` de `apps/api-default` solo haces:

```ts
// apps/api-default/app.module.ts

const envModules = (process.env.ENABLED_MODULES ?? '')
  .split(',')
  .map(m => m.trim().toUpperCase())
  .filter(Boolean);

validateModules(envModules);

const enabledModules = envModules;
const dynamicModules: Type[] = getModulesToLoad(enabledModules);

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CoreModule,
    ...dynamicModules,
  ],
})
export class AppModule {}
```

En `.env`:

```env
ENABLED_MODULES=AI,CUSTOMERS
```

---

## Schema Drizzle para módulos

Los esquemas de cada módulo viven en `packages/database/src/schema/`. Ejemplo para Customers:

```ts
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

---

## Resumen: receta para crear un módulo

1. **Dominio**
   - Crear `domain/entities/<entity>.entity.ts`.
   - Crear `domain/repositories/<entity>.repository.ts` (interfaces).
   - Crear `domain/use-cases/` con casos de uso.

2. **Infraestructura**
   - Crear `infrastructure/persistence/drizzle-<entity>.repository.ts`.
   - Crear `infrastructure/http/<entity>.controller.ts`.

3. **Módulo**
   - Crear `<module>.module.ts` y registrar providers y controllers.

4. **Integración**
   - Registrar el módulo en `apps/api-default/module-registry.ts`.
   - Añadir schema Drizzle en `packages/database/src/schema/`.
   - Habilitarlo con `ENABLED_MODULES=MODULO` en `.env`.

5. **Convenciones del core**
   - Usar siempre `businessId` para aislamiento multi-tenant.
   - Usar `userId` para auditoría (`createdBy`, `updatedBy`).
   - Implementar paginación, filtros y manejo de errores siguiendo las convenciones de la REST API.

---