import type { ForecastResult, DailyPrediction } from '../../application/types';

export class ForecastResultVO implements ForecastResult {
  constructor(
    public readonly productId: string,
    public readonly locationId: string | null,
    public readonly currentStock: number,
    public readonly predictedStock: number,
    public readonly consumptionRate: number,
    public readonly daysUntilStockout: number | null,
    public readonly confidence: number,
    public readonly method: 'MOVING_AVERAGE' | 'EXPONENTIAL_SMOOTHING' | 'AI',
    public readonly predictions: DailyPrediction[],
  ) {}

  static create(params: ForecastResult): ForecastResultVO {
    return new ForecastResultVO(
      params.productId,
      params.locationId,
      params.currentStock,
      params.predictedStock,
      params.consumptionRate,
      params.daysUntilStockout,
      params.confidence,
      params.method,
      params.predictions,
    );
  }
}
