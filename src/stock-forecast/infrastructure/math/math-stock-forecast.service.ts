import { Injectable } from '@nestjs/common';
import type {
  ForecastParams,
  ForecastResult,
  DailyPrediction,
  HistoricalMove,
} from '../../application/types';
import type { StockForecastProvider } from '../../domain/ports/stock-forecast.provider';

export type MathMethod = 'MOVING_AVERAGE' | 'EXPONENTIAL_SMOOTHING';

@Injectable()
export class MathStockForecastService implements StockForecastProvider {
  async forecast(params: ForecastParams): Promise<ForecastResult> {
    return Promise.resolve(this.exponentialSmoothingForecast(params));
  }

  movingAverageForecast(params: ForecastParams): ForecastResult {
    if (params.historicalMoves.length < 7) {
      return this.createEmptyResult(params, 0.3, 'MOVING_AVERAGE', params.historicalMoves);
    }

    const consumptionRate = this.calculateConsumptionRate(
      params.historicalMoves,
    );
    const currentStock = this.calculateCurrentStock(params.historicalMoves);
    const predictions = this.generatePredictions(
      currentStock,
      consumptionRate,
      params.daysAhead,
    );

    const predictedStock =
      predictions[predictions.length - 1]?.predictedQuantity ?? currentStock;
    const daysUntilStockout =
      consumptionRate > 0 ? Math.floor(currentStock / consumptionRate) : null;

    const confidence = this.calculateConfidence(params.historicalMoves.length);

    return {
      productId: params.productId,
      locationId: params.locationId ?? null,
      currentStock,
      predictedStock,
      consumptionRate,
      daysUntilStockout,
      confidence,
      method: 'MOVING_AVERAGE',
      predictions,
    };
  }

  exponentialSmoothingForecast(params: ForecastParams): ForecastResult {
    if (params.historicalMoves.length < 7) {
      return this.createEmptyResult(params, 0.3, 'EXPONENTIAL_SMOOTHING', params.historicalMoves);
    }

    const alpha = 0.3;
    const consumptionRate = this.calculateExponentialSmoothingRate(
      params.historicalMoves,
      alpha,
    );
    const currentStock = this.calculateCurrentStock(params.historicalMoves);
    const predictions = this.generatePredictions(
      currentStock,
      consumptionRate,
      params.daysAhead,
    );

    const predictedStock =
      predictions[predictions.length - 1]?.predictedQuantity ?? currentStock;
    const daysUntilStockout =
      consumptionRate > 0 ? Math.floor(currentStock / consumptionRate) : null;

    const confidence = this.calculateConfidence(params.historicalMoves.length);

    return {
      productId: params.productId,
      locationId: params.locationId ?? null,
      currentStock,
      predictedStock,
      consumptionRate,
      daysUntilStockout,
      confidence,
      method: 'EXPONENTIAL_SMOOTHING',
      predictions,
    };
  }

  private calculateConsumptionRate(moves: HistoricalMove[]): number {
    if (moves.length < 2) return 0;

    const sorted = [...moves].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const firstDate = new Date(sorted[0].date);
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const daysDiff = Math.max(
      1,
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const totalConsumption = moves.reduce(
      (sum, m) => sum + Math.max(m.quantity, 0),
      0,
    );
    return totalConsumption / daysDiff;
  }

  private calculateExponentialSmoothingRate(
    moves: HistoricalMove[],
    alpha: number,
  ): number {
    if (moves.length < 2) return 0;

    const sorted = [...moves].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let smoothed = Math.max(sorted[0].quantity, 0);

    for (let i = 1; i < sorted.length; i++) {
      const value = Math.max(sorted[i].quantity, 0);
      smoothed = alpha * value + (1 - alpha) * smoothed;
    }

    return smoothed;
  }

  private calculateCurrentStock(moves: HistoricalMove[]): number {
    let stock = 0;
    for (const move of moves) {
      stock -= move.quantity;
    }
    return Math.max(0, stock);
  }

  private generatePredictions(
    currentStock: number,
    consumptionRate: number,
    daysAhead: number,
  ): DailyPrediction[] {
    const predictions: DailyPrediction[] = [];
    const today = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const predictedQuantity = Math.max(0, currentStock - consumptionRate * i);
      const variance = consumptionRate * 0.1 * Math.sqrt(i);

      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedQuantity: Math.round(predictedQuantity * 100) / 100,
        lowerBound:
          Math.round(Math.max(0, predictedQuantity - variance) * 100) / 100,
        upperBound: Math.round((predictedQuantity + variance) * 100) / 100,
      });
    }

    return predictions;
  }

  private createEmptyResult(
    params: ForecastParams,
    confidence: number,
    method: 'MOVING_AVERAGE' | 'EXPONENTIAL_SMOOTHING',
    moves: HistoricalMove[],
  ): ForecastResult {
    const currentStock = this.calculateCurrentStock(moves);
    return {
      productId: params.productId,
      locationId: params.locationId ?? null,
      currentStock,
      predictedStock: currentStock,
      consumptionRate: 0,
      daysUntilStockout: null,
      confidence,
      method,
      predictions: [],
    };
  }

  private calculateConfidence(historyLength: number): number {
    if (historyLength >= 90) return 0.85;
    if (historyLength >= 60) return 0.75;
    if (historyLength >= 30) return 0.65;
    if (historyLength >= 14) return 0.5;
    return 0.3;
  }
}
