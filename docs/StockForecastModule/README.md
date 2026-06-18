# StockForecastModule

Documentación técnica del módulo de predicción de inventario.

## Índice

1. [Visión General](./01-stock-forecast-overview.md) - Arquitectura, métodos de predicción, endpoints
2. [Guía de Uso](./02-stock-forecast-usage.md) - Ejemplos de uso, casos de uso comunes
3. [Integración](./03-stock-forecast-integration.md) - Integración con Inventory, AiModule, casos de uso

## Resumen

El `StockForecastModule` es un **módulo global transversal** que proporciona predicciones de inventario usando métodos matemáticos o IA.

### Características Principales

- **Métodos**: Moving Average, Exponential Smoothing, IA (LLM)
- **Auto-integración**: Detecta automáticamente si InventoryModule está disponible
- **Fallback IA → MATH**: Si la IA falla, usa método matemático
- **Puerto desacoplado**: Usa `InventoryHistoryProvider` para obtener datos

### API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/stock-forecast/:productId` | Obtener forecast |

### Query Parameters

| Parámetro | Default | Descripción |
|-----------|---------|-------------|
| `locationId` | - | Filtrar por ubicación |
| `daysAhead` | 30 | Días de predicción |
| `method` | AUTO | AUTO, MATH, o AI |

### Habilitación

```env
ENABLED_MODULES=STOCK_FORECAST
```

### Configuración IA

```env
AI_STOCK_FORECAST_ENABLED=true
AI_STOCK_FORECAST_MODEL=openai/gpt-4o-mini
```

## Path Alias

```typescript
import { ... } from '#stock-forecast';
```
