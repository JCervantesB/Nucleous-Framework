import { ListConfigParametersUseCase } from '../../src/core/domain/config-parameter/use-cases/list-config-parameters.use-case';
import { ConfigParameter } from '../../src/core/domain/config-parameter/config-parameter.entity';
import type { ConfigParameterRepository } from '../../src/core/domain/config-parameter/config-parameter.repository';

describe('ListConfigParametersUseCase (Unit)', () => {
  let useCase: ListConfigParametersUseCase;
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
    useCase = new ListConfigParametersUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe listar parametros de negocio si businessId existe', async () => {
      const mockParams = [
        ConfigParameter.create({ key: 'theme', value: 'dark', businessId: 'biz-1' }) as any,
        ConfigParameter.create({ key: 'language', value: 'es', businessId: 'biz-1' }) as any,
      ];
      mockRepo.listByBusiness.mockResolvedValue(mockParams);

      const result = await useCase.execute('biz-1');

      expect(result.data).toHaveLength(2);
      expect(mockRepo.listByBusiness).toHaveBeenCalledWith('biz-1');
    });

    it('debe listar parametros globales si no hay businessId', async () => {
      const mockParams = [
        ConfigParameter.create({ key: 'app_name', value: 'Nucleous' }) as any,
      ];
      mockRepo.listGlobal.mockResolvedValue(mockParams);

      const result = await useCase.execute();

      expect(result.data).toHaveLength(1);
      expect(mockRepo.listGlobal).toHaveBeenCalled();
    });

    it('debe retornar array vacio si no hay parametros', async () => {
      mockRepo.listGlobal.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.data).toEqual([]);
    });
  });
});