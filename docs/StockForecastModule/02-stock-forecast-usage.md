# Uso del Módulo de Stock Forecast

## Inyección de Use Cases y Servicios

```typescript
import { Injectable } from '@nestjs/common';
import {
  ForecastStockUseCase,
  MathStockForecastService,
  AIStockForecastService,
  INVENTORY_HISTORY_PROVIDER,
  InventoryHistoryProvider,
} from '#stock-forecast';

@Injectable()
export class MiServicio {
  constructor(
    private readonly forecastUseCase: ForecastStockUseCase,
    private readonly mathService: MathStockForecastService,
    private readonly aiService: AIStockForecastService,
    @Inject(INVENTORY_HISTORY_PROVIDOR)
    private readonly historyProvider: InventoryHistoryProvider,
  ) {}
}
```

---

## Predicción Básica (API REST)

```bash
# Usando método AUTO (recomendado)
GET /api/v1/stock-forecast/uuid-producto

# Con ubicación específica
GET /api/v1/stock-forecast/uuid-producto?locationId=uuid-almacen

# Forzar método matemático
GET /api/v1/stock-forecast/uuid-producto?method=MATH

# Predicción a 60 días
GET /api/v1/stock-forecast/uuid-producto?daysAhead=60

# Usar IA (requiere AI_STOCK_FORECAST_ENABLED=true)
GET /api/v1/stock-forecast/uuid-producto?method=AI
```

---

## Uso Programático

### Método AUTO (Recomendado)

```typescript
const result = await this.forecastUseCase.execute(
  {
    productId: 'uuid-producto',
    locationId: 'uuid-almacen',
    daysAhead: 30,
    method: 'AUTO',
  },
  this.mathService,
  this.aiService,
);

console.log(result.currentStock);     // 150
console.log(result.predictedStock);   // 89.5
console.log(result.consumptionRate);  // 2.5 (unidades/día)
console.log(result.daysUntilStockout); // 36
console.log(result.confidence);       // 0.85
console.log(result.method);           // 'EXPONENTIAL_SMOOTHING' o 'AI'
```

### Método MATH (Siempre Disponible)

```typescript
const result = await this.mathService.exponentialSmoothingForecast({
  productId: 'uuid-producto',
  locationId: 'uuid-almacen',
  daysAhead: 30,
  historicalMoves: [
    { date: new Date('2026-06-01'), quantity: 10 },
    { date: new Date('2026-06-02'), quantity: 15 },
    { date: new Date('2026-06-03'), quantity: 8 },
    // ... más movimientos
  ],
});
```

### Método AI (Requiere AiModule)

```typescript
// Configurar variables de entorno:
// AI_STOCK_FORECAST_ENABLED=true
// AI_STOCK_FORECAST_MODEL=openai/gpt-4o-mini

const result = await this.aiService.forecast({
  productId: 'uuid-producto',
  locationId: 'uuid-almacen',
  daysAhead: 30,
  historicalMoves: [
    { date: new Date('2026-05-01'), quantity: 10 },
    // ... ≥30 días de histórico requeridos
  ],
});
```

---

## Predicción Manual (Sin Inventory)

### Proporcionar Histórico Propio

```typescript
@Injectable()
export class MiServicio {
  constructor(
    private readonly mathService: MathStockForecastService,
  ) {}

  async forecastWithOwnHistory(productId: string) {
    // Obtener histórico de tu propia fuente de datos
    const myMoves = await this.getMovesFromMySource(productId);

    const result = this.mathService.exponentialSmoothingForecast({
      productId,
      daysAhead: 30,
      historicalMoves: myMoves.map(m => ({
        date: m.date,
        quantity: m.type === 'consumption' ? m.amount : -m.amount,
      })),
    });

    return result;
  }
}
```

---

## Interpretar Resultados

### Confidence (Nivel de Confianza)

| Histórico | Confidence |
|-----------|------------|
| ≥90 días | 0.85 |
| ≥60 días | 0.75 |
| ≥30 días | 0.65 |
| ≥14 días | 0.50 |
| <14 días | 0.30 |

### Predicciones Diarias

```typescript
result.predictions.forEach((day) => {
  console.log(`
    Fecha: ${day.date}
    Stock estimado: ${day.predictedQuantity}
    Rango: [${day.lowerBound}, ${day.upperBound}]
  `);
});
```

---

## Casos de Uso

### 1. Dashboard de Inventario

```typescript
async function getInventoryDashboard(productId: string) {
  const forecast = await this.forecastUseCase.execute(
    { productId, daysAhead: 30, method: 'AUTO' },
    this.mathService,
    this.aiService,
  );

  return {
    stockActual: forecast.currentStock,
    stockPredicho: forecast.predictedStock,
    tasaConsumo: forecast.consumptionRate,
    diasRestantes: forecast.daysUntilStockout,
    nivelConfianza: forecast.confidence,
    necesitaReabastecimiento: forecast.daysUntilStockout <= 7,
  };
}
```

### 2. Alertas de Stock Bajo

```typescript
async function checkStockAlerts(productId: string, thresholdDays = 7) {
  const forecast = await this.forecastUseCase.execute(
    { productId, daysAhead: 30, method: 'AUTO' },
    this.mathService,
    this.aiService,
  );

  if (forecast.daysUntilStockout && forecast.daysUntilStockout <= thresholdDays) {
    return {
      alert: true,
      producto: productId,
      diasRestantes: forecast.daysUntilStockout,
      stockActual: forecast.currentStock,
      sugerencia: `Solicitar ${Math.ceil(forecast.consumptionRate * 30)} unidades`,
    };
  }

  return { alert: false };
}
```

### 3. Planificar Reabastecimiento

```typescript
async function planReplenishment(productId: string) {
  const forecast = await this.forecastUseCase.execute(
    { productId, daysAhead: 60, method: 'AUTO' },
    this.mathService,
    this.aiService,
  );

  const leadTimeDays = 7; // Tiempo de entrega del proveedor
  const safetyStock = forecast.consumptionRate * 3; // 3 días de safety stock

  const daysUntilOrder = (forecast.daysUntilStockout ?? 30) - leadTimeDays - safetyStock;

  return {
    producto: productId,
    stockActual: forecast.currentStock,
    consumoDiario: forecast.consumptionRate,
    diasHastaStockout: forecast.daysUntilStockout,
    fechaRecomendadaPedido: daysUntilOrder > 0
      ? new Date(Date.now() + daysUntilOrder * 24 * 60 * 60 * 1000)
      : 'ORDENAR INMEDIATAMENTE',
    cantidadPedido: Math.ceil(forecast.consumptionRate * 30), // 30 días de stock
  };
}
```

---

## Implementar un Provider Personalizado

Puedes implementar tu propio `StockForecastProvider`:

```typescript
import { Injectable } from '@nestjs/common';
import type { ForecastParams, ForecastResult } from '#stock-forecast';
import type { StockForecastProvider } from '#stock-forecast/domain/ports/stock-forecast.provider';

@Injectable()
export class MyCustomForecastProvider implements StockForecastProvider {
  async forecast(params: ForecastParams): Promise<ForecastResult> {
    // Tu lógica de predicción aquí
    const result = await this.myPredictionAlgorithm(params);

    return {
      productId: params.productId,
      locationId: params.locationId ?? null,
      currentStock: result.currentStock,
      predictedStock: result.finalStock,
      consumptionRate: result.rate,
      daysUntilStockout: result.daysLeft,
      confidence: result.confidence,
      method: 'CUSTOM',
      predictions: result.dailyForecasts,
    };
  }
}
```

---

## Validaciones

| Campo | Regla |
|-------|-------|
| `daysAhead` | 1-365 días |
| `method` | AUTO, MATH, o AI |
| Histórico para AI | ≥30 días requeridos |
| Histórico para MATH | ≥7 días requeridos |

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 422 | No hay movimientos históricos |
| 422 | IA solicitada pero no disponible |
| 422 | Histórico insuficiente para el método |
