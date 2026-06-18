# Visión General del Módulo de Stock Forecast (StockForecastModule)

## Arquitectura

El `StockForecastModule` es un **módulo global transversal** que proporciona predicciones de inventario. Puede ser utilizado por Inventory u otros módulos sin dependencias obligatorias.

```
src/stock-forecast/
├── domain/                              # Contratos y value objects
│   ├── ports/
│   │   ├── stock-forecast.provider.ts      # Puerto para forecast
│   │   └── inventory-history.provider.ts  # Puerto para historial
│   └── value-objects/
│       └── forecast-result.vo.ts
├── application/                          # Casos de uso y tipos
│   ├── stock-forecast.tokens.ts          # Tokens DI
│   ├── types.ts                         # Tipos compartidos
│   └── use-cases/
│       └── forecast-stock.use-case.ts    # Use case principal
├── infrastructure/
│   ├── math/
│   │   └── math-stock-forecast.service.ts   # Forecast sin IA
│   ├── ai/
│   │   └── ai-stock-forecast.service.ts      # Forecast con IA
│   └── persistence/
│       └── mock-inventory-history.provider.ts
├── interfaces/http/
│   ├── stock-forecast.controller.ts
│   └── dto/
│       └── stock-forecast.dtos.ts
└── stock-forecast.module.ts
```

## Conceptos Clave

### Módulo Transversal

StockForecastModule no pertenece a ningún módulo de negocio específico. Es un servicio reutilizable que:
- No modifica Inventory ni Products
- Puede ser consumido por cualquier módulo
- Funciona con o sin IA

### Puerto: StockForecastProvider

```typescript
export interface StockForecastProvider {
  forecast(params: ForecastParams): Promise<ForecastResult>;
}
```

### Puerto: InventoryHistoryProvider

Permite desacoplar de InventoryModule:

```typescript
export interface HistoricalMove {
  date: Date;
  quantity: number;  // positivo = consumo, negativo = entrada
}

export interface InventoryHistoryProvider {
  getHistoricalMoves(params: {
    productId: string;
    locationId?: string;
    daysBack?: number;
  }): Promise<HistoricalMove[]>;
}
```

### Auto-Integración con Inventory

StockForecastModule detecta automáticamente si `INVENTORY_MOVE_REPOSITORY` está disponible:

```typescript
{
  provide: INVENTORY_HISTORY_PROVIDER,
  useFactory: (moveRepo: any) => {
    if (moveRepo) {
      return createInventoryHistoryProviderFromRepo(moveRepo);
    }
    return new MockInventoryHistoryProvider();
  },
  inject: [{ token: 'INVENTORY_MOVE_REPOSITORY', optional: true }],
}
```

## Tipos Principales

### ForecastParams

```typescript
interface ForecastParams {
  productId: string;
  locationId?: string;
  daysAhead: number;              // default: 30
  historicalMoves: HistoricalMove[];
}
```

### ForecastResult

```typescript
interface ForecastResult {
  productId: string;
  locationId: string | null;
  currentStock: number;
  predictedStock: number;
  consumptionRate: number;         // unidades/día
  daysUntilStockout: number | null;
  confidence: number;             // 0-1
  method: 'MOVING_AVERAGE' | 'EXPONENTIAL_SMOOTHING' | 'AI';
  predictions: DailyPrediction[];
}

interface DailyPrediction {
  date: string;                   // YYYY-MM-DD
  predictedQuantity: number;
  lowerBound: number;
  upperBound: number;
}
```

## Métodos de Predicción

| Método | Descripción | Requerimientos |
|--------|-------------|----------------|
| `MOVING_AVERAGE` | Media móvil simple | ≥7 días histórico |
| `EXPONENTIAL_SMOOTHING` | Suavizado exponencial (α=0.3) | ≥7 días histórico |
| `AI` | Predicción con LLM | ≥30 días histórico + AiModule |

## Selección de Método

| method | Condición | Acción |
|--------|-----------|--------|
| `MATH` | Siempre | Usar Exponential Smoothing |
| `AI` | `AI_STOCK_FORECAST_ENABLED=true` + AiModule cargado | Usar AIStockForecastService |
| `AI` | Sin IA disponible | Error 422 |
| `AUTO` | IA habilitada + ≥30 días | Usar AI |
| `AUTO` | De lo contrario | Usar MATH |

## API REST

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/stock-forecast/:productId` | Obtener forecast |

### Query Parameters

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `locationId` | string | - | Filtrar por ubicación |
| `daysAhead` | number | 30 | Días de predicción (1-365) |
| `method` | AUTO/MATH/AI | AUTO | Método de forecast |

### Respuesta

```json
{
  "productId": "uuid",
  "locationId": "uuid",
  "currentStock": "150.00",
  "predictedStock": "89.50",
  "consumptionRate": "2.50",
  "daysUntilStockout": 36,
  "confidence": 0.85,
  "method": "EXPONENTIAL_SMOOTHING",
  "predictions": [
    {
      "date": "2026-06-17",
      "predictedQuantity": "147.50",
      "lowerBound": "140.00",
      "upperBound": "155.00"
    }
  ]
}
```

## Integración con IA

El módulo usa `AiService` (AiModule) para predicciones avanzadas:

```typescript
constructor(
  @Optional() @Inject(AI_SERVICE) private readonly aiService: AiService | null,
) {}
```

El `@Optional()` permite que el módulo funcione incluso si `AiModule` no está cargado.

## Tests

**40 tests passing**:
- MathStockForecastService: 10 tests
- AIStockForecastService: 10 tests
- ForecastStockUseCase: 13 tests
- StockForecastController: 7 tests

## Habilitación

```env
ENABLED_MODULES=STOCK_FORECAST
```
