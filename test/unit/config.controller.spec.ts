import { ConfigController } from '../../src/core/infrastructure/http/config.controller';
import { GetConfigParameterUseCase } from '../../src/core/domain/config-parameter/use-cases/get-config-parameter.use-case';
import { SetConfigParameterUseCase } from '../../src/core/domain/config-parameter/use-cases/set-config-parameter.use-case';
import { ListConfigParametersUseCase } from '../../src/core/domain/config-parameter/use-cases/list-config-parameters.use-case';
import { CurrentBusinessService } from '../../src/core/application/current-business.service';
import { ConfigParameter } from '../../src/core/domain/config-parameter/config-parameter.entity';

describe('ConfigController (Unit)', () => {
  let controller: ConfigController;
  let mockGetConfigUseCase: jest.Mocked<GetConfigParameterUseCase>;
  let mockSetConfigUseCase: jest.Mocked<SetConfigParameterUseCase>;
  let mockListConfigParametersUseCase: jest.Mocked<ListConfigParametersUseCase>;
  let mockCurrentBusiness: jest.Mocked<CurrentBusinessService>;

  beforeEach(() => {
    mockGetConfigUseCase = { execute: jest.fn() } as any;
    mockSetConfigUseCase = { execute: jest.fn() } as any;
    mockListConfigParametersUseCase = { execute: jest.fn() } as any;
    mockCurrentBusiness = { getBusinessId: jest.fn().mockReturnValue('biz-123') } as any;

    controller = new ConfigController(
      mockGetConfigUseCase,
      mockSetConfigUseCase,
      mockListConfigParametersUseCase,
      mockCurrentBusiness,
    );
  });

  describe('list', () => {
    it('debe listar parametros del negocio actual si no hay businessId query', async () => {
      mockListConfigParametersUseCase.execute.mockResolvedValue({
        data: [ConfigParameter.create({ key: 'theme', value: 'dark' }) as any],
      });

      const result = await controller.list(undefined);

      expect(result.data).toHaveLength(1);
      expect(mockListConfigParametersUseCase.execute).toHaveBeenCalledWith('biz-123');
    });

    it('debe usar businessId de query si se proporciona', async () => {
      mockListConfigParametersUseCase.execute.mockResolvedValue({ data: [] });

      await controller.list('other-biz');

      expect(mockListConfigParametersUseCase.execute).toHaveBeenCalledWith('other-biz');
    });

    it('debe listar globales si currentBusiness falla', async () => {
      mockCurrentBusiness.getBusinessId.mockImplementation(() => {
        throw new Error('No business');
      });
      mockListConfigParametersUseCase.execute.mockResolvedValue({ data: [] });

      await controller.list(undefined);

      expect(mockListConfigParametersUseCase.execute).toHaveBeenCalledWith(undefined);
    });
  });

  describe('get', () => {
    it('debe retornar el valor del parametro', async () => {
      mockGetConfigUseCase.execute.mockResolvedValue({ value: 'dark' });

      const result = await controller.get('theme', undefined);

      expect(result).toEqual({ value: 'dark' });
    });

    it('debe usar businessId del query si se proporciona', async () => {
      mockGetConfigUseCase.execute.mockResolvedValue({ value: 'dark' });

      await controller.get('theme', 'other-biz');

      expect(mockGetConfigUseCase.execute).toHaveBeenCalledWith({
        key: 'theme',
        businessId: 'other-biz',
      });
    });

    it('debe usar negocio actual si no hay businessId en query', async () => {
      mockGetConfigUseCase.execute.mockResolvedValue({ value: 'dark' });

      await controller.get('theme', undefined);

      expect(mockGetConfigUseCase.execute).toHaveBeenCalledWith({
        key: 'theme',
        businessId: 'biz-123',
      });
    });
  });

  describe('set', () => {
    it('debe crear o actualizar un parametro', async () => {
      const mockParam = ConfigParameter.create({
        key: 'theme',
        value: 'dark',
        businessId: 'biz-123',
      }) as any;
      mockSetConfigUseCase.execute.mockResolvedValue({ configParameter: mockParam });

      const result = await controller.set(
        { key: 'theme', value: 'dark' },
        { user: { id: 'user-123' } } as any,
        undefined,
      );

      expect(result.key).toBe('theme');
      expect(result.value).toBe('dark');
    });

    it('debe usar userId del request', async () => {
      const mockParam = ConfigParameter.create({ key: 'theme', value: 'dark' }) as any;
      mockSetConfigUseCase.execute.mockResolvedValue({ configParameter: mockParam });

      await controller.set(
        { key: 'theme', value: 'dark' },
        { user: { id: 'custom-user' } } as any,
        undefined,
      );

      expect(mockSetConfigUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'custom-user' }),
      );
    });

    it('debe usar businessId del query si se proporciona', async () => {
      const mockParam = ConfigParameter.create({ key: 'theme', value: 'dark' }) as any;
      mockSetConfigUseCase.execute.mockResolvedValue({ configParameter: mockParam });

      await controller.set(
        { key: 'theme', value: 'dark' },
        { user: undefined } as any,
        'other-biz',
      );

      expect(mockSetConfigUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ businessId: 'other-biz' }),
      );
    });
  });
});