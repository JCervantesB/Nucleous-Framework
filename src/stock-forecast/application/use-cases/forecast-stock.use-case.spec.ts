import { UnprocessableEntityException } from '@nestjs/common';
import { ForecastStockUseCase } from './forecast-stock.use-case';
import type {
  ForecastInput,
  ForecastResult,
  InventoryMoveInput,
} from '../types';
import type { StockForecastProvider } from '../../domain/ports/stock-forecast.provider';
import type { InventoryHistoryProvider } from '../../domain/ports/inventory-history.provider';

describe('ForecastStockUseCase', () => {
  let useCase: ForecastStockUseCase;
  let mockMathProvider: jest.Mocked<StockForecastProvider>;
  let mockAiProvider: jest.Mocked<StockForecastProvider>;
  let mockHistoryProvider: jest.Mocked<InventoryHistoryProvider>;

  beforeEach(() => {
    mockMathProvider = {
      forecast: jest.fn(),
    } as any;

    mockAiProvider = {
      forecast: jest.fn(),
    } as any;

    mockHistoryProvider = {
      getHistoricalMoves: jest.fn(),
    } as any;

    useCase = new ForecastStockUseCase(mockHistoryProvider);
  });

  afterEach(() => {
    delete process.env.AI_STOCK_FORECAST_ENABLED;
    jest.clearAllMocks();
  });

  const createInventoryMoves = (
    count: number,
    dailyConsumption: number,
  ): InventoryMoveInput[] => {
    const moves: InventoryMoveInput[] = [];
    const today = new Date();

    for (let i = count; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      moves.push({
        date,
        quantity: dailyConsumption,
        moveType: 'OUTBOUND',
      });
    }

    return moves;
  };

  const createMockForecastResult = (
    overrides: Partial<ForecastResult> = {},
  ): ForecastResult => ({
    productId: 'product-1',
    locationId: null,
    currentStock: 100,
    predictedStock: 80,
    consumptionRate: 5,
    daysUntilStockout: 20,
    confidence: 0.75,
    method: 'MOVING_AVERAGE',
    predictions: [],
    ...overrides,
  });

  describe('execute', () => {
    it('debe generar forecast con método MATH por defecto', async () => {
      const moves = createInventoryMoves(30, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(
        createMockForecastResult({ method: 'MOVING_AVERAGE' }),
      );

      const input: ForecastInput = { productId: 'product-1' };
      const result = await useCase.execute(input, mockMathProvider, null);

      expect(result.method).toBe('MOVING_AVERAGE');
      expect(mockMathProvider.forecast).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'product-1',
          historicalMoves: expect.any(Array),
        }),
      );
    });

    it('debe usar método MATH cuando se solicita explícitamente', async () => {
      const moves = createInventoryMoves(30, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(
        createMockForecastResult({ method: 'EXPONENTIAL_SMOOTHING' }),
      );

      const input: ForecastInput = { productId: 'product-1', method: 'MATH' };
      const result = await useCase.execute(input, mockMathProvider, null);

      expect(result.method).toBe('EXPONENTIAL_SMOOTHING');
    });

    it('debe lanzar error cuando no hay movimientos históricos', async () => {
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue([]);

      const input: ForecastInput = { productId: 'product-1' };

      await expect(
        useCase.execute(input, mockMathProvider, null),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('debe usar AI cuando está habilitado y hay suficiente historial', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';
      const moves = createInventoryMoves(35, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockAiProvider.forecast.mockResolvedValue(
        createMockForecastResult({ method: 'AI' }),
      );

      const input: ForecastInput = { productId: 'product-1', method: 'AUTO' };
      const result = await useCase.execute(input, mockMathProvider, mockAiProvider);

      expect(result.method).toBe('AI');
    });

    it('debe usar MATH aunque AI esté habilitado si no hay suficiente historial', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';
      const moves = createInventoryMoves(15, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(
        createMockForecastResult({ method: 'MOVING_AVERAGE' }),
      );

      const input: ForecastInput = { productId: 'product-1', method: 'AUTO' };
      const result = await useCase.execute(input, mockMathProvider, mockAiProvider);

      expect(result.method).toBe('MOVING_AVERAGE');
    });

    it('debe pasar locationId al forecast provider', async () => {
      const moves = createInventoryMoves(30, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(createMockForecastResult());

      const input: ForecastInput = {
        productId: 'product-1',
        locationId: 'location-1',
      };
      await useCase.execute(input, mockMathProvider, null);

      expect(mockMathProvider.forecast).toHaveBeenCalledWith(
        expect.objectContaining({
          locationId: 'location-1',
        }),
      );
    });

    it('debe usar daysAhead por defecto de 30', async () => {
      const moves = createInventoryMoves(30, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(createMockForecastResult());

      const input: ForecastInput = { productId: 'product-1' };
      await useCase.execute(input, mockMathProvider, null);

      expect(mockMathProvider.forecast).toHaveBeenCalledWith(
        expect.objectContaining({
          daysAhead: 30,
        }),
      );
    });

    it('debe usar daysAhead personalizado cuando se provee', async () => {
      const moves = createInventoryMoves(30, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(createMockForecastResult());

      const input: ForecastInput = { productId: 'product-1', daysAhead: 14 };
      await useCase.execute(input, mockMathProvider, null);

      expect(mockMathProvider.forecast).toHaveBeenCalledWith(
        expect.objectContaining({
          daysAhead: 14,
        }),
      );
    });

    it('debe adaptar movimientos INBOUND a quantity negativa', async () => {
      const moves: InventoryMoveInput[] = [
        { date: new Date(), quantity: 100, moveType: 'INBOUND' },
      ];
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(createMockForecastResult());

      const input: ForecastInput = { productId: 'product-1' };
      await useCase.execute(input, mockMathProvider, null);

      expect(mockMathProvider.forecast).toHaveBeenCalledWith(
        expect.objectContaining({
          historicalMoves: expect.arrayContaining([
            expect.objectContaining({
              quantity: -100,
            }),
          ]),
        }),
      );
    });

    it('debe adaptar movimientos OUTBOUND a quantity positiva', async () => {
      const moves: InventoryMoveInput[] = [
        { date: new Date(), quantity: 50, moveType: 'OUTBOUND' },
      ];
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(createMockForecastResult());

      const input: ForecastInput = { productId: 'product-1' };
      await useCase.execute(input, mockMathProvider, null);

      expect(mockMathProvider.forecast).toHaveBeenCalledWith(
        expect.objectContaining({
          historicalMoves: expect.arrayContaining([
            expect.objectContaining({
              quantity: 50,
            }),
          ]),
        }),
      );
    });

    it('debe filtrar movimientos que no son INBOUND ni OUTBOUND', async () => {
      const moves: InventoryMoveInput[] = [
        { date: new Date(), quantity: 100, moveType: 'INBOUND' },
        { date: new Date(), quantity: 50, moveType: 'TRANSFER' },
        { date: new Date(), quantity: 30, moveType: 'ADJUSTMENT' },
        { date: new Date(), quantity: 20, moveType: 'OUTBOUND' },
      ];
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockResolvedValue(createMockForecastResult());

      const input: ForecastInput = { productId: 'product-1' };
      await useCase.execute(input, mockMathProvider, null);

      expect(mockMathProvider.forecast).toHaveBeenCalledWith(
        expect.objectContaining({
          historicalMoves: expect.arrayContaining([
            expect.objectContaining({ quantity: -100 }),
            expect.objectContaining({ quantity: 20 }),
          ]),
        }),
      );
      expect(mockMathProvider.forecast).toHaveBeenCalledWith(
        expect.objectContaining({
          historicalMoves: expect.not.arrayContaining([
            expect.objectContaining({ quantity: 50 }),
            expect.objectContaining({ quantity: 30 }),
          ]),
        }),
      );
    });

    it('debe propagar errores del forecast provider', async () => {
      const moves = createInventoryMoves(30, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);
      mockMathProvider.forecast.mockRejectedValue(
        new Error('Error del provider'),
      );

      const input: ForecastInput = { productId: 'product-1' };

      await expect(
        useCase.execute(input, mockMathProvider, null),
      ).rejects.toThrow('Error del provider');
    });

    it('debe hacer fallback a MATH cuando AI falla si método era AUTO', async () => {
      process.env.AI_STOCK_FORECAST_ENABLED = 'true';
      const moves = createInventoryMoves(35, 10);
      mockHistoryProvider.getHistoricalMoves.mockResolvedValue(moves);

      mockAiProvider.forecast.mockRejectedValue(
        new UnprocessableEntityException('AI error'),
      );
      mockMathProvider.forecast.mockResolvedValue(
        createMockForecastResult({ method: 'MOVING_AVERAGE' }),
      );

      const input: ForecastInput = { productId: 'product-1', method: 'AUTO' };
      const result = await useCase.execute(
        input,
        mockMathProvider,
        mockAiProvider,
      );

      expect(result.method).toBe('MOVING_AVERAGE');
      expect(mockAiProvider.forecast).toHaveBeenCalledTimes(1);
      expect(mockMathProvider.forecast).toHaveBeenCalledTimes(1);
    });
  });
});
