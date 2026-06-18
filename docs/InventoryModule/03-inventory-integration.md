# Integración del Módulo de Inventario

## Habilitación en la Aplicación

### 1. Configurar ENABLED_MODULES

```env
ENABLED_MODULES=INVENTORY
```

### 2. Registro Automático

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
  'PRODUCTS',
  'INVENTORY',  // <-- Incluir aquí
  'STOCK_FORECAST',
] as const;
```

### 3. Carga en AppModule

El `InventoryModule` no es `@Global()`, se carga condicionalmente:

```typescript
// apps/api-default/app.module.ts
import { Module, Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { ProductsModule } from '../../src/products/products.module';
import { InventoryModule } from '../../src/inventory/inventory.module';
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

if (enabledModules.includes('INVENTORY')) {
  imports.push(InventoryModule);
}

@Module({ imports })
export class AppModule {}
```

## Tokens de Inyección

### Providers

```typescript
// src/inventory/domain/inventory.tokens.ts
export const INVENTORY_LOCATION_REPOSITORY = Symbol('INVENTORY_LOCATION_REPOSITORY');
export const INVENTORY_MOVE_REPOSITORY = Symbol('INVENTORY_MOVE_REPOSITORY');
```

### Uso en Servicios

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  INVENTORY_LOCATION_REPOSITORY,
  INVENTORY_MOVE_REPOSITORY,
  InventoryLocationRepository,
  InventoryMoveRepository,
} from '#inventory';

@Injectable()
export class MiServicio {
  constructor(
    @Inject(INVENTORY_LOCATION_REPOSITORY)
    private readonly locationRepo: InventoryLocationRepository,
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepo: InventoryMoveRepository,
  ) {}
}
```

## Uso como Proveedor de Datos

### Ejemplo: StockForecastModule consume Inventory

```typescript
// src/stock-forecast/infrastructure/persistence/inventory-history.provider.ts

@Injectable()
export class InventoryHistoryProvider implements StockForecastProvider {
  constructor(
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepo: InventoryMoveRepository,
  ) {}

  async getHistoricalMoves(params: {
    productId: string;
    locationId?: string;
    daysBack?: number;
  }) {
    const moves = await this.moveRepo.listByProduct(
      params.productId,
      'default-business',
    );

    return moves
      .filter((move) => {
        // Filtrar por fecha y ubicación
      })
      .map((move) => ({
        date: move.createdAt,
        quantity: parseFloat(move.quantity),
        moveType: move.moveType,
      }));
  }
}
```

### Ejemplo: OrderModule consume Inventory

```typescript
@Injectable()
export class OrderValidationService {
  constructor(
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepo: InventoryMoveRepository,
    @Inject(INVENTORY_LOCATION_REPOSITORY)
    private readonly locationRepo: InventoryLocationRepository,
  ) {}

  async validateStock(items: OrderItem[], businessId: string) {
    for (const item of items) {
      const stock = await this.getStock.execute({
        businessId,
        productId: item.productId,
        variantId: item.variantId,
        locationId: item.locationId,
      });

      if (parseFloat(stock.total) < item.quantity) {
        throw new InsufficientStockException(
          `Producto ${item.productId} - Stock insuficiente`,
        );
      }
    }
  }
}
```

## Integración con ProductsModule

### Dependencia Unidireccional

```
ProductsModule ──► InventoryModule
     ▲                    │
     │                    │
     └────────────────────┘
         NO hay ciclos
```

**Regla:** InventoryModule consume ProductsModule, pero ProductsModule NO sabe nada de Inventory.

### Puerto InventoryHistoryProvider

StockForecastModule define un puerto (`InventoryHistoryProvider`) que InventoryModule implementa:

```typescript
// src/stock-forecast/domain/ports/inventory-history.provider.ts
export interface HistoricalMove {
  date: Date;
  quantity: number;      // Positivo = consumo, negativo = entrada
  moveType: string;
}

export interface InventoryHistoryProvider {
  getHistoricalMoves(params: {
    productId: string;
    locationId?: string;
    daysBack?: number;
  }): Promise<HistoricalMove[]>;
}
```

### Auto-Integración

StockForecastModule detecta automáticamente si `INVENTORY_MOVE_REPOSITORY` está disponible:

```typescript
// src/stock-forecast/stock-forecast.module.ts
{
  provide: INVENTORY_HISTORY_PROVIDER,
  useFactory: (moveRepo: any) => {
    if (moveRepo) {
      return createInventoryHistoryProviderFromRepo(moveRepo);
    }
    return new MockInventoryHistoryProvider();
  },
  inject: [
    {
      token: 'INVENTORY_MOVE_REPOSITORY',
      optional: true,
    },
  ],
},
```

## Estructura de Archivos

```
src/inventory/
├── domain/
│   ├── entities/
│   │   ├── inventory-location.entity.ts
│   │   ├── inventory-move.entity.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── inventory-location.repository.ts
│   │   ├── inventory-move.repository.ts
│   │   └── index.ts
│   └── inventory.tokens.ts
├── application/
│   └── use-cases/
│       ├── create-location.use-case.ts
│       ├── list-locations.use-case.ts
│       ├── update-location.use-case.ts
│       ├── create-move.use-case.ts
│       ├── confirm-move.use-case.ts
│       ├── complete-move.use-case.ts
│       ├── list-moves.use-case.ts
│       ├── get-stock.use-case.ts
│       ├── adjust-inventory.use-case.ts
│       └── index.ts
├── infrastructure/
│   └── persistence/
│       ├── drizzle-location.repository.ts
│       ├── drizzle-move.repository.ts
│       └── index.ts
├── interfaces/
│   └── http/
│       ├── location.controller.ts
│       ├── move.controller.ts
│       ├── stock.controller.ts
│       └── dto/
│           ├── location.dtos.ts
│           ├── move.dtos.ts
│           ├── stock.dtos.ts
│           └── index.ts
├── inventory.module.ts
└── index.ts
```

## Troubleshooting

### "No hay movimientos históricos" en StockForecast

**Causa**: StockForecastModule no puede conectar con InventoryModule.

**Solución**: Verificar que ambos módulos están habilitados:
```env
ENABLED_MODULES=INVENTORY,STOCK_FORECAST
```

### Movimiento no puede cambiar de estado

**Causa**: Violación del ciclo de vida del movimiento.

| Error | Causa | Solución |
|-------|-------|----------|
| "Solo se pueden confirmar movimientos en estado DRAFT" | El movimiento ya fue confirmado | No re-confirmar |
| "Solo se pueden completar movimientos en estado CONFIRMED" | El movimiento no está confirmado | Confirmar primero |
| "No se pueden cancelar movimientos ya completados" | El movimiento está DONE | No cancelar DONE |

### Stock calculado no coincide con físico

**Causa**: Movimientos en estados incorrectos o faltantes.

**Solución**: Usar ajuste de inventario:
```typescript
await adjustInventory.execute({
  businessId,
  productId,
  locationId,
  newQuantity: 'cantidad-real',
  reason: 'Recuento físico',
});
```
