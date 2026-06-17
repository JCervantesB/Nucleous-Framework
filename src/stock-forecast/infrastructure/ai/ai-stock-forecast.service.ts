import { Inject, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { z } from 'zod';
import type { ForecastParams, ForecastResult, DailyPrediction, HistoricalMove } from '../../application/types';
import type { StockForecastProvider } from '../../domain/ports/stock-forecast.provider';
import { AI_SERVICE } from '../../../ai/application/ai.tokens';
import type { AiService } from '../../../ai/application/ai.service';

const AiForecastResponseSchema = z.object({
  currentStock: z.number(),
  consumptionRate: z.number(),
  daysUntilStockout: z.number().nullable(),
  confidence: z.number().min(0).max(1),
  predictions: z.array(
    z.object({
      date: z.string(),
      predictedQuantity: z.number(),
      lowerBound: z.number(),
      upperBound: z.number(),
    }),
  ),
});

type AiForecastResponse = z.infer<typeof AiForecastResponseSchema>;

@Injectable()
export class AIStockForecastService implements StockForecastProvider {
  private readonly logger = new Logger(AIStockForecastService.name);

  constructor(
    @Inject(AI_SERVICE) private readonly aiService: AiService,
  ) {}

  async forecast(params: ForecastParams): Promise<ForecastResult> {
    const enabled = process.env.AI_STOCK_FORECAST_ENABLED === 'true';
    const model = process.env.AI_STOCK_FORECAST_MODEL ?? 'openai/gpt-4o-mini';

    if (!enabled) {
      throw new UnprocessableEntityException(
        'Predicción con IA no está habilitada. Configure AI_STOCK_FORECAST_ENABLED=true',
      );
    }

    if (params.historicalMoves.length < 30) {
      throw new UnprocessableEntityException(
        'La predicción con IA requiere al menos 30 días de historial',
      );
    }

    const prompt = this.buildPrompt(params);

    try {
      const result = await this.aiService.generateObject<AiForecastResponse>({
        prompt,
        model,
        schema: AiForecastResponseSchema,
      });

      return {
        productId: params.productId,
        locationId: params.locationId ?? null,
        currentStock: result.object.currentStock,
        predictedStock:
          result.object.predictions[result.object.predictions.length - 1]
            ?.predictedQuantity ?? result.object.currentStock,
        consumptionRate: result.object.consumptionRate,
        daysUntilStockout: result.object.daysUntilStockout,
        confidence: result.object.confidence,
        method: 'AI',
        predictions: result.object.predictions,
      };
    } catch (error) {
      this.logger.error('Error en predicción con IA', error);
      throw new UnprocessableEntityException(
        'Error al generar predicción con IA. Intente con método MATH.',
      );
    }
  }

  private buildPrompt(params: ForecastParams): string {
    const movesSummary = this.summarizeMoves(params.historicalMoves);
    const predictionsCount = params.daysAhead ?? 30;

    return `
Eres un experto en análisis de inventario y forecasting.

Analiza el siguiente historial de movimientos de inventario y genera predicciones de stock.

## Producto
ID: ${params.productId}
${params.locationId ? `Ubicación: ${params.locationId}` : ''}

## Historial de Movimientos
${movesSummary}

## Requerimientos
- Genera predicciones para los próximos ${predictionsCount} días
- Devuelve el stock actual estimado basado en el historial
- Calcula la tasa de consumo promedio
- Estima cuántos días hasta que se agote el stock (si aplica)
- Asigna un nivel de confianza de 0 a 1 basado en la calidad de los datos

## Formato de Respuesta (JSON)
Debes devolver SOLO un objeto JSON válido con esta estructura:
{
  "currentStock": número,
  "consumptionRate": número (unidades por día),
  "daysUntilStockout": número o null,
  "confidence": número entre 0 y 1,
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "predictedQuantity": número,
      "lowerBound": número,
      "upperBound": número
    }
  ]
}

El lowerBound y upperBound deben ser intervalos de confianza (±10-20% es razonable).
`;
  }

  private summarizeMoves(moves: HistoricalMove[]): string {
    const sorted = [...moves].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return sorted
      .slice(-30)
      .map((m) => {
        const date = new Date(m.date).toISOString().split('T')[0];
        const type = m.quantity > 0 ? 'CONSUMO' : 'ENTRADA';
        return `${date}: ${type} ${Math.abs(m.quantity)}`;
      })
      .join('\n');
  }
}
