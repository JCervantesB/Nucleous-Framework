import { Business } from '../../src/core/domain/entities/business.entity';
import { GetBusinessUseCase } from '../../src/core/domain/use-cases/get-business.use-case';

const mockBusinessRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
};

describe('GetBusinessUseCase', () => {
  let useCase: GetBusinessUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetBusinessUseCase(mockBusinessRepository as any);
  });

  describe('execute', () => {
    it('debe retornar negocio cuando existe', async () => {
      const existingBusiness = Business.create({
        name: 'Existe',
        slug: 'existe',
      });
      mockBusinessRepository.findById.mockResolvedValue(existingBusiness);

      const result = await useCase.execute({ id: existingBusiness.id });

      expect(mockBusinessRepository.findById).toHaveBeenCalledWith(existingBusiness.id);
      expect(result.business).toBeInstanceOf(Business);
      expect(result.business?.name).toBe('Existe');
    });

    it('debe retornar business null cuando no existe', async () => {
      mockBusinessRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ id: 'no-existe' });

      expect(mockBusinessRepository.findById).toHaveBeenCalledWith('no-existe');
      expect(result.business).toBeNull();
    });

    it('debe llamar findById con el id correcto', async () => {
      const businessId = '123e4567-e89b-12d3-a456-426614174000';
      mockBusinessRepository.findById.mockResolvedValue(null);

      await useCase.execute({ id: businessId });

      expect(mockBusinessRepository.findById).toHaveBeenCalledWith(businessId);
    });
  });
});