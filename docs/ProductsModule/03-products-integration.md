# Integración del Módulo de Productos

## Habilitación en la Aplicación

### 1. Configurar ENABLED_MODULES

```env
ENABLED_MODULES=PRODUCTS
```

### 2. Registro en module-validator.ts

El módulo se registra automáticamente en `module-registry.ts`:

```typescript
// apps/api-default/module-registry.ts
export const VALID_MODULES = [
  'CORE',
  'AUTH',
  'DATABASE',
  'AI',
  'STORAGE',
  'EMAIL',
  'PRODUCTS',  // <-- Incluir aquí
  'INVENTORY',
  'STOCK_FORECAST',
] as const;
```

## Carga Automática en AppModule

El `ProductsModule` es un **módulo global** que se carga una sola vez:

```typescript
// apps/api-default/app.module.ts
import { Module } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { ProductsModule } from '../../src/products/products.module';
import { validateEnabledModules, getEnabledModules } from './module-validator';

validateEnabledModules();
const enabledModules = getEnabledModules();

const imports: Type<any>[] = [
  DatabaseModule,
  AuthModule,
  CoreModule,
];

if (enabledModules.includes('PRODUCTS')) {
  imports.push(ProductsModule);
}

@Module({ imports })
export class AppModule {}
```

## Log de Inicialización

Al iniciar con `PRODUCTS` habilitado, verás que los controllers se registran automáticamente:

```
[Nest] 12345 - 06/18/2026, 10:00:00 AM     LOG [RoutesResolver] ProductsController {/api/v1/products}
[Nest] 12345 - 06/18/2026, 10:00:00 AM     LOG [RoutesResolver] VariantController {/api/v1/products}
[Nest] 12345 - 06/18/2026, 10:00:00 AM     LOG [RoutesResolver] CategoryController {/api/v1/product-categories}
[Nest] 12345 - 06/18/2026, 10:00:00 AM     LOG [RoutesResolver] UnitMeasureController {/api/v1/product-unit-measures}
```

## Tokens de Inyección

### Providers

```typescript
// src/products/application/products.tokens.ts
export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
export const PRODUCT_VARIANT_REPOSITORY = Symbol('PRODUCT_VARIANT_REPOSITORY');
export const PRODUCT_CATEGORY_REPOSITORY = Symbol('PRODUCT_CATEGORY_REPOSITORY');
export const PRODUCT_UNIT_MEASURE_REPOSITORY = Symbol('PRODUCT_UNIT_MEASURE_REPOSITORY');
```

### Uso en Servicios

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  PRODUCT_CATEGORY_REPOSITORY,
  ProductRepository,
  CategoryRepository,
} from '#products';

@Injectable()
export class MiServicio {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
    @Inject(PRODUCT_CATEGORY_REPOSITORY) private readonly categoryRepo: CategoryRepository,
  ) {}
}
```

## Uso como Proveedor de Datos

ProductsModule puede ser consumido por cualquier módulo de la aplicación:

### Ejemplo: StockForecastModule

```typescript
@Injectable()
export class StockForecastService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async forecast(productId: string, businessId: string) {
    const product = await this.productRepo.findById(productId, businessId);

    if (!product.trackInventory) {
      throw new Error('Este producto no tiene tracking de inventario');
    }

    // Continuar con forecast...
  }
}
```

### Ejemplo: OrderModule

```typescript
@Injectable()
export class OrderService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY) private readonly variantRepo: ProductVariantRepository,
  ) {}

  async createOrderLine(dto: CreateOrderLineDto) {
    const product = await this.productRepo.findById(dto.productId, dto.businessId);
    const variant = dto.variantId
      ? await this.variantRepo.findById(dto.variantId, dto.businessId)
      : null;

    const price = product.basePrice + (variant?.priceModifier ?? 0);

    return {
      productId: product.id,
      variantId: variant?.id,
      quantity: dto.quantity,
      unitPrice: price,
      total: price * dto.quantity,
    };
  }
}
```

## Agregar un Nuevo Caso de Uso

1. **Crear el caso de uso en `application/use-cases/`**:

```typescript
// src/products/application/use-cases/deactivate-product.use-case.ts
@Injectable()
export class DeactivateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async execute(input: { id: string; businessId: string }): Promise<void> {
    const product = await this.productRepo.findById(input.id, input.businessId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    product.deactivate();
    await this.productRepo.update(product);
  }
}
```

2. **Registrar en el módulo**:

```typescript
// src/products/products.module.ts
import { DeactivateProductUseCase } from './application/use-cases/deactivate-product.use-case';

@Module({
  providers: [
    // ... otros providers
    DeactivateProductUseCase,
  ],
  exports: [
    // ... otros exports
    DeactivateProductUseCase,
  ],
})
export class ProductsModule {}
```

## Estructura de Archivos

```
src/products/
├── domain/
│   ├── entities/
│   │   ├── product.entity.ts
│   │   ├── product-variant.entity.ts
│   │   ├── product-category.entity.ts
│   │   ├── product-unit-measure.entity.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── product.repository.ts
│   │   ├── product-variant.repository.ts
│   │   ├── product-category.repository.ts
│   │   ├── product-unit-measure.repository.ts
│   │   └── index.ts
│   └── products.types.ts
├── application/
│   ├── products.tokens.ts
│   └── use-cases/
│       ├── create-product.use-case.ts
│       ├── update-product.use-case.ts
│       ├── get-product.use-case.ts
│       ├── list-products.use-case.ts
│       ├── delete-product.use-case.ts
│       ├── create-variant.use-case.ts
│       ├── update-variant.use-case.ts
│       ├── list-variants.use-case.ts
│       ├── delete-variant.use-case.ts
│       ├── create-category.use-case.ts
│       ├── update-category.use-case.ts
│       ├── list-categories.use-case.ts
│       ├── delete-category.use-case.ts
│       ├── create-unit-measure.use-case.ts
│       ├── update-unit-measure.use-case.ts
│       ├── list-unit-measures.use-case.ts
│       └── delete-unit-measure.use-case.ts
├── infrastructure/
│   └── persistence/
│       ├── drizzle-product.repository.ts
│       ├── drizzle-product-variant.repository.ts
│       ├── drizzle-product-category.repository.ts
│       ├── drizzle-product-unit-measure.repository.ts
│       └── index.ts
├── interfaces/
│   └── http/
│       ├── product.controller.ts
│       ├── variant.controller.ts
│       ├── category.controller.ts
│       ├── unit-measure.controller.ts
│       └── dto/
│           ├── product.dtos.ts
│           ├── variant.dtos.ts
│           ├── category.dtos.ts
│           ├── unit-measure.dtos.ts
│           └── index.ts
├── products.module.ts
└── index.ts
```

## Troubleshooting

### "Cannot find module '#products'"

**Causa**: El path alias `#products` no está configurado en `tsconfig.json`.

**Solución**: Verificar que existe en `paths`:

```json
{
  "compilerOptions": {
    "paths": {
      "#products": ["src/products"],
      "#products/*": ["src/products/*"]
    }
  }
}
```

### "Producto no encontrado" al crear variante

**Causa**: El `productId` no existe o no pertenece al negocio.

**Solución**: Verificar que el producto existe antes de crear la variante:

```typescript
const product = await this.productRepo.findById(dto.productId, businessId);
if (!product) {
  throw new NotFoundException('Producto no encontrado');
}
```

### SKU duplicado

**Causa**: Ya existe un producto con ese SKU en el mismo negocio.

**Solución**: Usar un SKU diferente o buscar el producto existente:

```typescript
const existing = await this.productRepo.findBySku(dto.sku, businessId);
if (existing) {
  throw new ConflictException(`Ya existe un producto con SKU: ${dto.sku}`);
}
```
