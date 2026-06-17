import type { ForecastParams, ForecastResult } from '../../application/types';

export interface StockForecastProvider {
  forecast(params: ForecastParams): Promise<ForecastResult>;
}
