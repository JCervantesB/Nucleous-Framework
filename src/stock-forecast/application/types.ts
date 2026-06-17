export interface HistoricalMove {
  date: Date;
  quantity: number;
}

export interface ForecastParams {
  productId: string;
  locationId?: string;
  daysAhead: number;
  historicalMoves: HistoricalMove[];
}

export interface DailyPrediction {
  date: string;
  predictedQuantity: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastResult {
  productId: string;
  locationId: string | null;
  currentStock: number;
  predictedStock: number;
  consumptionRate: number;
  daysUntilStockout: number | null;
  confidence: number;
  method: 'MOVING_AVERAGE' | 'EXPONENTIAL_SMOOTHING' | 'AI';
  predictions: DailyPrediction[];
}
