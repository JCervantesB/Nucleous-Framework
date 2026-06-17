import { MathStockForecastService } from './math-stock-forecast.service';
import type { ForecastParams, HistoricalMove } from '../../application/types';

describe('MathStockForecastService', () => {
  let service: MathStockForecastService;

  beforeEach(() => {
    service = new MathStockForecastService();
  });

  const createConsumptionMoves = (
    days: number,
    dailyConsumption: number,
  ): HistoricalMove[] => {
    const moves: HistoricalMove[] = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      moves.push({
        date,
        quantity: dailyConsumption,
      });
    }

    return moves;
  };

  const createMixedMoves = (
    initialStock: number,
    dailyConsumption: number,
    days: number,
  ): HistoricalMove[] => {
    const moves: HistoricalMove[] = [];
    const today = new Date();

    const entradaDate = new Date(today);
    entradaDate.setDate(entradaDate.getDate() - days - 1);
    moves.push({ date: entradaDate, quantity: -initialStock });

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      moves.push({
        date,
        quantity: dailyConsumption,
      });
    }

    return moves;
  };

  describe('movingAverageForecast', () => {
    it('debe calcular correctamente el consumo promedio', () => {
      const moves = createConsumptionMoves(30, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const result = service.movingAverageForecast(params);

      expect(result.consumptionRate).toBeCloseTo(10, 0);
      expect(result.method).toBe('MOVING_AVERAGE');
    });

    it('debe generar predicciones para los dias solicitados', () => {
      const moves = createConsumptionMoves(30, 5);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const result = service.movingAverageForecast(params);

      expect(result.predictions).toHaveLength(7);
      expect(result.predictions[0].date).toBeDefined();
    });

    it('debe calcular daysUntilStockout correctamente', () => {
      const moves = createMixedMoves(200, 10, 5);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 30,
        historicalMoves: moves,
      };

      const result = service.movingAverageForecast(params);

      expect(result.currentStock).toBeGreaterThan(0);
      expect(result.consumptionRate).toBeGreaterThan(0);
      expect(result.daysUntilStockout).toBeGreaterThan(0);
    });

    it('debe retornar resultado vacío con poco historial pero mantener stock real', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const moves: HistoricalMove[] = [
        { date: yesterday, quantity: -100 },
        { date: today, quantity: 10 },
      ];

      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const result = service.movingAverageForecast(params);

      expect(result.currentStock).toBe(90);
      expect(result.predictions).toHaveLength(0);
      expect(result.consumptionRate).toBe(0);
      expect(result.daysUntilStockout).toBeNull();
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('exponentialSmoothingForecast', () => {
    it('debe aplicar suavizado exponencial correctamente', () => {
      const moves = createConsumptionMoves(30, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const result = service.exponentialSmoothingForecast(params);

      expect(result.method).toBe('EXPONENTIAL_SMOOTHING');
      expect(result.consumptionRate).toBeGreaterThan(0);
    });

    it('debe generar predicciones con menor varianza en dias cercanos', () => {
      const moves = createConsumptionMoves(30, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 10,
        historicalMoves: moves,
      };

      const result = service.exponentialSmoothingForecast(params);

      const firstVariance = Math.abs(
        result.predictions[0].upperBound - result.predictions[0].lowerBound,
      );
      const lastVariance = Math.abs(
        result.predictions[9].upperBound - result.predictions[9].lowerBound,
      );

      expect(firstVariance).toBeLessThan(lastVariance);
    });
  });

  describe('forecast (default)', () => {
    it('debe usar exponential smoothing por defecto', async () => {
      const moves = createConsumptionMoves(30, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const result = await service.forecast(params);

      expect(result.method).toBe('EXPONENTIAL_SMOOTHING');
    });
  });

  describe('confidence calculation', () => {
    it('debe tener mayor confianza con más historial', () => {
      const shortMoves = createConsumptionMoves(10, 10);
      const longMoves = createConsumptionMoves(90, 10);

      const shortResult = service.movingAverageForecast({
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: shortMoves,
      });

      const longResult = service.movingAverageForecast({
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: longMoves,
      });

      expect(longResult.confidence).toBeGreaterThan(shortResult.confidence);
    });
  });

  describe('edge cases', () => {
    it('debe manejar array vacío correctamente', () => {
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: [],
      };

      const result = service.movingAverageForecast(params);

      expect(result.consumptionRate).toBe(0);
      expect(result.currentStock).toBe(0);
      expect(result.predictions).toHaveLength(0);
      expect(result.daysUntilStockout).toBeNull();
    });

    it('debe retornar daysUntilStockout null cuando solo hay entradas', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const moves: HistoricalMove[] = [
        { date: yesterday, quantity: -100 },
      ];

      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const result = service.movingAverageForecast(params);

      expect(result.consumptionRate).toBe(0);
      expect(result.currentStock).toBe(100);
      expect(result.daysUntilStockout).toBeNull();
    });
  });
});
