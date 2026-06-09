import { SetConfigParameterUseCase } from '../../src/core/domain/config-parameter/use-cases/set-config-parameter.use-case';
import { ConfigParameter } from '../../src/core/domain/config-parameter/config-parameter.entity';
import type { ConfigParameterRepository } from '../../src/core/domain/config-parameter/config-parameter.repository';

describe('SetConfigParameterUseCase (Unit)', () => {
  let useCase: SetConfigParameterUseCase;
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
    useCase = new SetConfigParameterUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe crear o actualizar un parametro de negocio', async () => {
      const mockParam = ConfigParameter.create({
        key: 'theme',
        value: 'dark',
        businessId: 'biz-1',
        createdBy: 'user-123',
      }) as any;
      mockRepo.upsert.mockResolvedValue(mockParam);

      const result = await useCase.execute({
        key: 'theme',
        value: 'dark',
        businessId: 'biz-1',
        userId: 'user-123',
      });

      expect(result.configParameter).toBeDefined();
      expect(result.configParameter.key).toBe('theme');
      expect(result.configParameter.value).toBe('dark');
      expect(mockRepo.upsert).toHaveBeenCalled();
    });

    it('debe crear parametro global sin businessId', async () => {
      const mockParam = ConfigParameter.create({
        key: 'app_name',
        value: 'Nucleous',
      }) as any;
      mockRepo.upsert.mockResolvedValue(mockParam);

      const result = await useCase.execute({
        key: 'app_name',
        value: 'Nucleous',
      });

      expect(result.configParameter.businessId).toBeNull();
    });

    it('debe usar upsert para crear o actualizar', async () => {
      const mockParam = ConfigParameter.create({
        key: 'timezone',
        value: 'America/Mexico_City',
        businessId: 'biz-1',
      }) as any;
      mockRepo.upsert.mockResolvedValue(mockParam);

      await useCase.execute({
        key: 'timezone',
        value: 'America/Mexico_City',
        businessId: 'biz-1',
      });

      expect(mockRepo.upsert).toHaveBeenCalled();
    });
  });
});