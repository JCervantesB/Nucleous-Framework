import { Business } from '../../src/core/domain/entities/business.entity';
import { CreateBusinessUseCase } from '../../src/core/domain/use-cases/create-business.use-case';

const mockBusinessRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
};

describe('CreateBusinessUseCase', () => {
  let useCase: CreateBusinessUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateBusinessUseCase(mockBusinessRepository as any);
  });

  describe('execute', () => {
    it('debe crear negocio cuando slug no existe', async () => {
      mockBusinessRepository.findBySlug.mockResolvedValue(null);
      mockBusinessRepository.create.mockImplementation(async (business) => business);

      const input = {
        name: 'Nuevo Negocio',
        slug: 'nuevo-negocio',
        legalName: 'Nuevo Negocio SA',
        countryCode: 'MX',
      };

      const result = await useCase.execute(input);

      expect(mockBusinessRepository.findBySlug).toHaveBeenCalledWith('nuevo-negocio');
      expect(mockBusinessRepository.create).toHaveBeenCalled();
      expect(result.business).toBeInstanceOf(Business);
      expect(result.business.name).toBe('Nuevo Negocio');
      expect(result.business.slug).toBe('nuevo-negocio');
    });

    it('debe lanzar error cuando slug ya existe', async () => {
      const existingBusiness = Business.create({
        name: 'Existente',
        slug: 'existente',
      });
      mockBusinessRepository.findBySlug.mockResolvedValue(existingBusiness);

      const input = {
        name: 'Otro Negocio',
        slug: 'existente',
      };

      await expect(useCase.execute(input)).rejects.toThrow('El slug ya está en uso');
      expect(mockBusinessRepository.create).not.toHaveBeenCalled();
    });

    it('debe pasar todos los campos opcionales al negocio', async () => {
      mockBusinessRepository.findBySlug.mockResolvedValue(null);
      mockBusinessRepository.create.mockImplementation(async (business) => business);

      const input = {
        name: 'Completo',
        slug: 'completo',
        legalName: 'Legal',
        countryCode: 'US',
        timezone: 'America/New_York',
        currencyCode: 'USD',
        publicName: 'Public',
      };

      const result = await useCase.execute(input);

      expect(result.business.legalName).toBe('Legal');
      expect(result.business.countryCode).toBe('US');
      expect(result.business.timezone).toBe('America/New_York');
      expect(result.business.currencyCode).toBe('USD');
      expect(result.business.publicName).toBe('Public');
    });

    it('debe crear negocio solo con campos requeridos', async () => {
      mockBusinessRepository.findBySlug.mockResolvedValue(null);
      mockBusinessRepository.create.mockImplementation(async (business) => business);

      const input = {
        name: 'Minimal',
        slug: 'minimal',
      };

      const result = await useCase.execute(input);

      expect(result.business.name).toBe('Minimal');
      expect(result.business.slug).toBe('minimal');
      expect(result.business.legalName).toBeNull();
      expect(result.business.countryCode).toBeNull();
    });
  });
});