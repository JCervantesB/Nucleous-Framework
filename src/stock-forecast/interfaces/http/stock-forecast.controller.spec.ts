import { UnprocessableEntityException } from '@nestjs/common';
import { StockForecastController } from './stock-forecast.controller';

describe('StockForecastController', () => {
  let controller: StockForecastController;
  let mockUseCase: any;
  let mockMathService: any;
  let mockAiService: any;

  beforeEach(() => {
    mockUseCase = {
      execute: jest.fn(),
    };

    mockMathService = {
      forecast: jest.fn(),
    };

    mockAiService = {
      forecast: jest.fn(),
    };

    controller = new StockForecastController(
      mockUseCase,
      mockMathService,
      mockAiService,
    );
  });

  afterEach(() => {
    delete process.env.AI_STOCK_FORECAST_ENABLED;
    jest.clearAllMocks();
  });

  const createMockForecastResult = (overrides: Partial<any> = {}) => ({
    productId: 'product-1',
    locationId: 'location-1',
    currentStock: 150.5,
    predictedStock: 89.25,
    consumptionRate: 2.5,
    daysUntilStockout: 36,
    confidence: 0.85,
    method: 'MOVING_AVERAGE',
    predictions: [
      {
        date: '2026-06-17',
        predictedQuantity: 147.5,
        lowerBound: 140.0,
        upperBound: 155.0,
      },
    ],
    ...overrides,
  });

  describe('getForecast', () => {
    it('debe retornar forecast con números formateados a string', async () => {
      const mockResult = createMockForecastResult();
      mockUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getForecast('product-1', {
        locationId: 'location-1',
        daysAhead: 30,
        method: 'AUTO',
      });

      expect(result.productId).toBe('product-1');
      expect(result.locationId).toBe('location-1');
      expect(result.currentStock).toBe('150.50');
      expect(result.predictedStock).toBe('89.25');
      expect(result.consumptionRate).toBe('2.50');
      expect(result.daysUntilStockout).toBe(36);
      expect(result.confidence).toBe(0.85);
      expect(result.method).toBe('MOVING_AVERAGE');
      expect(result.predictions[0].predictedQuantity).toBe('147.50');
    });

    it('debe pasar método MATH al use case', async () => {
      const mockResult = createMockForecastResult({ method: 'EXPONENTIAL_SMOOTHING' });
      mockUseCase.execute.mockResolvedValue(mockResult);

      await controller.getForecast('product-1', {
        method: 'MATH',
      });

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'MATH' }),
        mockMathService,
        mockAiService,
      );
    });

    it('debe propagar errores del use case', async () => {
      mockUseCase.execute.mockRejectedValue(
        new UnprocessableEntityException('No hay movimientos históricos'),
      );

      await expect(
        controller.getForecast('product-1', { method: 'AUTO' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('debe usar daysAhead por defecto de 30', async () => {
      const mockResult = createMockForecastResult();
      mockUseCase.execute.mockResolvedValue(mockResult);

      await controller.getForecast('product-1', {});

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ daysAhead: 30, method: 'AUTO' }),
        mockMathService,
        mockAiService,
      );
    });

    it('debe usar daysAhead personalizado', async () => {
      const mockResult = createMockForecastResult();
      mockUseCase.execute.mockResolvedValue(mockResult);

      await controller.getForecast('product-1', { daysAhead: 14 });

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ daysAhead: 14 }),
        mockMathService,
        mockAiService,
      );
    });

    it('debe incluir locationId en la llamada al use case', async () => {
      const mockResult = createMockForecastResult();
      mockUseCase.execute.mockResolvedValue(mockResult);

      await controller.getForecast('product-1', { locationId: 'warehouse-north' });

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ locationId: 'warehouse-north' }),
        mockMathService,
        mockAiService,
      );
    });

    it('debe formatear predictions con 2 decimales', async () => {
      const mockResult = createMockForecastResult({
        predictions: [
          { date: '2026-06-17', predictedQuantity: 147.555, lowerBound: 140.999, upperBound: 155.111 },
        ],
      });
      mockUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getForecast('product-1', {});

      expect(result.predictions[0].predictedQuantity).toBe('147.56');
      expect(result.predictions[0].lowerBound).toBe('141.00');
      expect(result.predictions[0].upperBound).toBe('155.11');
    });
  });
});
