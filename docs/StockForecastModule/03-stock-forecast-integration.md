# Integración del Módulo de Stock Forecast

## Habilitación en la Aplicación

### 1. Configurar ENABLED_MODULES

```env
ENABLED_MODULES=STOCK_FORECAST
```

### 2. Registro en module-validator.ts

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
  'INVENTORY',
  'STOCK_FORECAST',  // <-- Incluir aquí
] as const;
```

### 3. Carga en AppModule

El `StockForecastModule` es `@Global()` y se carga condicionalmente:

```typescript
// apps/api-default/app.module.ts
import { Module, Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { ProductsModule } from '../../src/products/products.module';
import { InventoryModule } from '../../src/inventory/inventory.module';
import { StockForecastModule } from '../../src/stock-forecast/stock-forecast.module';
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

if (enabledModules.includes('STOCK_FORECAST')) {
  imports.push(StockForecastModule);
}

@Module({ imports })
export class AppModule {}
```

## Auto-Integración con Inventory

StockForecastModule detecta automáticamente si InventoryModule está cargado:

```
┌─────────────────────┐     ┌─────────────────────┐
│  StockForecastModule  │────▶│  InventoryModule     │
│                      │     │                     │
│  - Detecta si        │     │  - Provee repositorio│
│    INVENTORY_MOVE    │     │    de movimientos    │
│    REPOSITORY existe │     │                     │
│  - Si existe: usa    │     │                     │
│    datos reales       │     │                     │
│  - Si no: usa mock   │     │                     │
└─────────────────────┘     └─────────────────────┘
```

### Sin InventoryModule

El módulo funciona con un `MockInventoryHistoryProvider`:

```typescript
{
  provide: INVENTORY_HISTORY_PROVIDER,
  useFactory: (moveRepo: any) => {
    if (moveRepo) {
      return createInventoryHistoryProviderFromRepo(moveRepo);
    }
    return new MockInventoryHistoryProvider();
  },
}
```

## Configuración con IA

### Habilitar IA

```env
# Habilitar predicción con IA
AI_STOCK_FORECAST_ENABLED=true

# Modelo a usar (opcional)
AI_STOCK_FORECAST_MODEL=openai/gpt-4o-mini
```

### Modelos Recomendados

| Modelo | Uso | Costo |
|--------|-----|-------|
| `openai/gpt-4o-mini` | Rápido, económico | Bajo |
| `google/gemma-4-31b-it:free` | Gratuito, razonamiento | Gratis |
| `anthropic/claude-3-haiku` | Balance | Medio |

## Integración con AiModule

El módulo usa `@Optional()` para permitir funcionar sin IA:

```typescript
@Injectable()
export class AIStockForecastService implements StockForecastProvider {
  constructor(
    @Optional() @Inject(AI_SERVICE) private readonly aiService: AiService | null,
  ) {}

  async forecast(params: ForecastParams): Promise<ForecastResult> {
    if (!this.aiService) {
      throw new UnprocessableEntityException(
        'AI Module no está cargado',
      );
    }
    // ...
  }
}
```

## Puerto: StockForecastProvider

Para crear tu propia implementación de forecast:

```typescript
// src/my-module/my-forecast.provider.ts
import { Injectable } from '@nestjs/common';
import type { ForecastParams, ForecastResult } from '#stock-forecast';
import type { StockForecastProvider } from '#stock-forecast/domain/ports/stock-forecast.provider';

@Injectable()
export class MyForecastProvider implements StockForecastProvider {
  async forecast(params: ForecastParams): Promise<ForecastResult> {
    // Implementación personalizada
    return {
      productId: params.productId,
      locationId: params.locationId ?? null,
      currentStock: 100,
      predictedStock: 80,
      consumptionRate: 2,
      daysUntilStockout: 40,
      confidence: 0.9,
      method: 'MY_CUSTOM_METHOD',
      predictions: [],
    };
  }
}
```

## Puerto: InventoryHistoryProvider

Para proporcionar histórico desde otra fuente:

```typescript
import { Injectable } from '@nestjs/common';
import type { HistoricalMove, InventoryHistoryProvider } from '#stock-forecast';

@Injectable()
export class MyHistoryProvider implements InventoryHistoryProvider {
  async getHistoricalMoves(params: {
    productId: string;
    locationId?: string;
    daysBack?: number;
  }): Promise<HistoricalMove[]> {
    // Obtener de tu fuente de datos
    const moves = await this.myDataSource.getMoves(params.productId);

    return moves.map(m => ({
      date: m.date,
      quantity: m.type === 'sale' ? m.amount : -m.amount,
    }));
  }
}
```

## Casos de Integración

### 1. Productos con Predicciones en Dashboard

```typescript
@Injectable()
export class ProductDashboardService {
  constructor(
    private readonly getProduct: GetProductUseCase,
    private readonly getStock: GetStockUseCase,
    private readonly forecastUseCase: ForecastStockUseCase,
    private readonly mathService: MathStockForecastService,
    private readonly aiService: AIStockForecastService,
  ) {}

  async getProductOverview(productId: string, businessId: string) {
    const product = await this.getProduct.execute({ id: productId, businessId });
    const stock = await this.getStock.execute({ productId, businessId });
    const forecast = await this.forecastUseCase.execute(
      { productId, daysAhead: 30, method: 'AUTO' },
      this.mathService,
      this.aiService,
    );

    return {
      producto: product.name,
      sku: product.sku,
      stockActual: stock.total,
      prediccion30Dias: forecast.predictedStock,
      diasHastaAgotarse: forecast.daysUntilStockout,
      nivelConfianza: forecast.confidence,
    };
  }
}
```

### 2. Módulo de Órdenes con Validación de Stock Futuro

```typescript
@Injectable()
export class OrderValidationService {
  constructor(
    private readonly forecastUseCase: ForecastStockUseCase,
    private readonly mathService: MathStockForecastService,
    private readonly aiService: AIStockForecastService,
  ) {}

  async validateOrderCanBeFulfilled(order: Order, businessId: string) {
    const forecast = await this.forecastUseCase.execute(
      {
        productId: order.productId,
        locationId: order.locationId,
        daysAhead: order.leadTimeDays,
        method: 'AUTO',
      },
      this.mathService,
      this.aiService,
    );

    const stockAtDelivery = forecast.predictions.find(
      p => p.date === order.deliveryDate
    )?.predictedQuantity ?? forecast.currentStock;

    if (stockAtDelivery < order.quantity) {
      return {
        canFulfill: false,
        stockAtDelivery,
        quantityRequested: order.quantity,
        shortage: order.quantity - stockAtDelivery,
      };
    }

    return { canFulfill: true, stockAtDelivery };
  }
}
```

## Estructura de Archivos

```
src/stock-forecast/
├── domain/
│   ├── ports/
│   │   ├── stock-forecast.provider.ts
│   │   └── inventory-history.provider.ts
│   └── value-objects/
│       └── forecast-result.vo.ts
├── application/
│   ├── stock-forecast.tokens.ts
│   ├── types.ts
│   └── use-cases/
│       └── forecast-stock.use-case.ts
├── infrastructure/
│   ├── math/
│   │   ├── math-stock-forecast.service.ts
│   │   └── math-stock-forecast.service.spec.ts
│   ├── ai/
│   │   ├── ai-stock-forecast.service.ts
│   │   └── ai-stock-forecast.service.spec.ts
│   └── persistence/
│       └── mock-inventory-history.provider.ts
├── interfaces/
│   └── http/
│       ├── stock-forecast.controller.ts
│       ├── stock-forecast.controller.spec.ts
│       └── dto/
│           └── stock-forecast.dtos.ts
├── stock-forecast.module.ts
└── index.ts
```

## Troubleshooting

### "No hay movimientos históricos"

**Causa**: El `InventoryHistoryProvider` no tiene datos.

**Solución**: Verificar que InventoryModule está habilitado y tiene movimientos:

```env
ENABLED_MODULES=INVENTORY,STOCK_FORECAST
```

### "AI Module no está cargado"

**Causa**: Se pidió método `AI` pero `AiModule` no está habilitado.

**Solución**:
1. Habilitar AiModule: `ENABLED_MODULES=AI,STOCK_FORECAST`
2. O usar método `MATH` o `AUTO`

### "La predicción con IA requiere al menos 30 días"

**Causa**: El histórico tiene menos de 30 días.

**Solución**: Usar método `MATH` que solo requiere 7 días, o esperar a tener más datos.

### Forecast no coincide con stock real

**Causa**: El cálculo de stock puede tener diferencias.

**Solución**: Verificar que los movimientos están correctamente clasificados:
- Entradas deben tener `quantity` negativo en el histórico
- Salidas deben tener `quantity` positivo
