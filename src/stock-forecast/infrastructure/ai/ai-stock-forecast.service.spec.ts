import { UnprocessableEntityException } from '@nestjs/common';
import { AIStockForecastService, AI_MIN_HISTORY_DAYS } from './ai-stock-forecast.service';
import type { ForecastParams, HistoricalMove } from '../../application/types';
import type { AiService } from '../../../ai/application/ai.service';

const mockGenerateObject = jest.fn();
const MockAiService = jest.fn().mockImplementation(() => ({
  generateObject: mockGenerateObject,
})) as jest.MockedClass<typeof AiService>;

describe('AIStockForecastService', () => {
  let service: AIStockForecastService;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockAiService = {
      generateObject: mockGenerateObject,
    } as any;

    service = new AIStockForecastService(mockAiService);
  });

  afterEach(() => {
    delete process.env.AI_STOCK_FORECAST_ENABLED;
    delete process.env.AI_STOCK_FORECAST_MODEL;
  });

  const createMoves = (days: number, dailyConsumption: number): HistoricalMove[] => {
    const moves: HistoricalMove[] = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      moves.push({ date, quantity: dailyConsumption });
    }

    return moves;
  };

  describe('forecast', () => {
    it('debe lanzar error cuando AI no está habilitada', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'false';

      const moves = createMoves(30, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      await expect(service.forecast(params)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('debe lanzar error cuando hay menos de 30 dias de historial', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';

      const moves = createMoves(15, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      await expect(service.forecast(params)).rejects.toThrow(
        `La predicción con IA requiere al menos ${AI_MIN_HISTORY_DAYS} días de historial`,
      );
    });

    it('debe generar forecast exitoso con IA habilitada y suficiente historial', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';

      const moves = createMoves(35, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const mockResponse = {
        object: {
          currentStock: 150,
          consumptionRate: 10,
          daysUntilStockout: 15,
          confidence: 0.85,
          predictions: [
            {
              date: '2026-06-18',
              predictedQuantity: 140,
              lowerBound: 130,
              upperBound: 150,
            },
          ],
        },
      };

      mockGenerateObject.mockResolvedValue(mockResponse);

      const result = await service.forecast(params);

      expect(result.productId).toBe('product-1');
      expect(result.method).toBe('AI');
      expect(result.currentStock).toBe(150);
      expect(result.consumptionRate).toBe(10);
      expect(result.daysUntilStockout).toBe(15);
      expect(result.confidence).toBe(0.85);
      expect(result.predictions).toHaveLength(1);
      expect(result.predictions[0].date).toBe('2026-06-18');
    });

    it('debe pasar el schema Zod a AiService', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';

      const moves = createMoves(35, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const mockResponse = {
        object: {
          currentStock: 100,
          consumptionRate: 5,
          daysUntilStockout: 20,
          confidence: 0.9,
          predictions: [],
        },
      };

      mockGenerateObject.mockResolvedValue(mockResponse);

      await service.forecast(params);

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          schema: expect.any(Object),
        }),
      );
    });

    it('debe usar modelo configurado via variable de entorno', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';
      process.env.AI_STOCK_FORECAST_MODEL = 'anthropic/claude-3';

      const moves = createMoves(35, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const mockResponse = {
        object: {
          currentStock: 100,
          consumptionRate: 5,
          daysUntilStockout: 20,
          confidence: 0.9,
          predictions: [],
        },
      };

      mockGenerateObject.mockResolvedValue(mockResponse);

      await service.forecast(params);

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'anthropic/claude-3',
        }),
      );
    });

    it('debe manejar errores de IA gracefully', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';

      const moves = createMoves(35, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      mockGenerateObject.mockRejectedValue(new Error('API Error'));

      await expect(service.forecast(params)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('debe incluir locationId en el resultado cuando está disponible', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';

      const moves = createMoves(35, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        locationId: 'location-1',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const mockResponse = {
        object: {
          currentStock: 100,
          consumptionRate: 5,
          daysUntilStockout: 20,
          confidence: 0.9,
          predictions: [],
        },
      };

      mockGenerateObject.mockResolvedValue(mockResponse);

      const result = await service.forecast(params);

      expect(result.locationId).toBe('location-1');
    });
  });

  describe('buildPrompt', () => {
    it('debe incluir productId en el prompt', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';

      const moves = createMoves(35, 10);
      const params: ForecastParams = {
        productId: 'test-product-123',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const mockResponse = {
        object: {
          currentStock: 100,
          consumptionRate: 5,
          daysUntilStockout: 20,
          confidence: 0.9,
          predictions: [],
        },
      };

      mockGenerateObject.mockResolvedValue(mockResponse);

      await service.forecast(params);

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('test-product-123'),
        }),
      );
    });

    it('debe incluir locationId en el prompt cuando está presente', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';

      const moves = createMoves(35, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        locationId: 'warehouse-north',
        daysAhead: 7,
        historicalMoves: moves,
      };

      const mockResponse = {
        object: {
          currentStock: 100,
          consumptionRate: 5,
          daysUntilStockout: 20,
          confidence: 0.9,
          predictions: [],
        },
      };

      mockGenerateObject.mockResolvedValue(mockResponse);

      await service.forecast(params);

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('warehouse-north'),
        }),
      );
    });

    it('debe usar diasAhead para cantidad de predicciones', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';

      const moves = createMoves(35, 10);
      const params: ForecastParams = {
        productId: 'product-1',
        daysAhead: 14,
        historicalMoves: moves,
      };

      const mockResponse = {
        object: {
          currentStock: 100,
          consumptionRate: 5,
          daysUntilStockout: 20,
          confidence: 0.9,
          predictions: [],
        },
      };

      mockGenerateObject.mockResolvedValue(mockResponse);

      await service.forecast(params);

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('14'),
        }),
      );
    });
  });
});
