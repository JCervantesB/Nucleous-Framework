import { GetConfigParameterUseCase } from '../../src/core/domain/config-parameter/use-cases/get-config-parameter.use-case';
import { ConfigParameter } from '../../src/core/domain/config-parameter/config-parameter.entity';
import type { ConfigParameterRepository } from '../../src/core/domain/config-parameter/config-parameter.repository';

describe('GetConfigParameterUseCase (Unit)', () => {
  let useCase: GetConfigParameterUseCase;
  let mockRepo: jest.Mocked<ConfigParameterRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByKey: jest.fn(),
      upsert: jest.fn(),
      listByBusiness: jest.fn(),
      listGlobal: jest.fn(),
    } as any;
    useCase = new GetConfigParameterUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe retornar valor del parametro encontrado', async () => {
      const mockParam = ConfigParameter.create({
        key: 'theme',
        value: 'dark',
        businessId: 'biz-1',
      }) as any;
      mockRepo.findByKey.mockResolvedValue(mockParam);

      const result = await useCase.execute({ key: 'theme', businessId: 'biz-1' });

      expect(result.value).toBe('dark');
    });

    it('debe retornar null si el parametro no existe', async () => {
      mockRepo.findByKey.mockResolvedValue(null);

      const result = await useCase.execute({ key: 'non_existent' });

      expect(result.value).toBeNull();
    });

    it('debe buscar sin businessId para parametros globales', async () => {
      mockRepo.findByKey.mockResolvedValue(null);

      await useCase.execute({ key: 'app_name' });

      expect(mockRepo.findByKey).toHaveBeenCalledWith('app_name', undefined);
    });
  });
});