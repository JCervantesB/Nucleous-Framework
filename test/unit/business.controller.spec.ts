import { BusinessController } from '../../src/core/infrastructure/http/business.controller';
import { CreateBusinessUseCase } from '../../src/core/domain/use-cases/create-business.use-case';
import { GetBusinessUseCase } from '../../src/core/domain/use-cases/get-business.use-case';
import { Business } from '../../src/core/domain/entities/business.entity';

describe('BusinessController (Unit)', () => {
  let controller: BusinessController;
  let mockCreateBusinessUseCase: jest.Mocked<CreateBusinessUseCase>;
  let mockGetBusinessUseCase: jest.Mocked<GetBusinessUseCase>;

  beforeEach(() => {
    mockCreateBusinessUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetBusinessUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new BusinessController(
      mockCreateBusinessUseCase,
      mockGetBusinessUseCase,
    );
  });

  describe('create', () => {
    it('debe crear un negocio y retornar el id', async () => {
      const mockBusiness = Business.create({
        name: 'Test Business',
        slug: 'test-business',
        legalName: 'Test Business SA',
      });
      mockCreateBusinessUseCase.execute.mockResolvedValue({
        business: mockBusiness as any,
      });

      const result = await controller.create({
        name: 'Test Business',
        slug: 'test-business',
        legalName: 'Test Business SA',
      });

      expect(result.id).toBe(mockBusiness.id);
      expect(result.name).toBe('Test Business');
      expect(result.slug).toBe('test-business');
    });

    it('debe llamar execute con los parametros correctos', async () => {
      mockCreateBusinessUseCase.execute.mockResolvedValue({
        business: Business.create({ name: 'Test', slug: 'test' }) as any,
      });

      await controller.create({
        name: 'Test Business',
        slug: 'test-business',
        countryCode: 'MX',
      });

      expect(mockCreateBusinessUseCase.execute).toHaveBeenCalledWith({
        name: 'Test Business',
        slug: 'test-business',
        legalName: undefined,
        countryCode: 'MX',
        timezone: undefined,
        currencyCode: undefined,
        publicName: undefined,
      });
    });
  });

  describe('getById', () => {
    it('debe retornar negocio cuando existe', async () => {
      const mockBusiness = Business.create({
        name: 'Test Business',
        slug: 'test-business',
      }) as any;
      mockGetBusinessUseCase.execute.mockResolvedValue({ business: mockBusiness });

      const result = await controller.getById('some-id');

      expect(result.name).toBe('Test Business');
    });

    it('debe retornar error cuando no existe', async () => {
      mockGetBusinessUseCase.execute.mockResolvedValue({ business: null });

      const result = await controller.getById('non-existent');

      expect(result).toEqual({ error: 'Negocio no encontrado' });
    });
  });
});