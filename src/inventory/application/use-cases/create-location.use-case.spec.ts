import { CreateLocationUseCase } from './create-location.use-case';

const mockLocationRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByCode: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CreateLocationUseCase', () => {
  let useCase: CreateLocationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateLocationUseCase(mockLocationRepo);
  });

  describe('execute', () => {
    const businessId = 'business-123';
    const input = {
      businessId,
      code: 'WH-001',
      name: 'Almacén Central',
      type: 'INTERNAL' as const,
    };

    it('debe crear una ubicación exitosamente', async () => {
      mockLocationRepo.findByCode.mockResolvedValue(null);
      mockLocationRepo.create.mockImplementation(async (location) => location);

      const result = await useCase.execute(input);

      expect(mockLocationRepo.findByCode).toHaveBeenCalledWith(
        input.code,
        businessId,
      );
      expect(mockLocationRepo.create).toHaveBeenCalled();
      expect(result.code).toBe(input.code);
      expect(result.name).toBe(input.name);
    });

    it('debe lanzar error si el código ya existe', async () => {
      mockLocationRepo.findByCode.mockResolvedValue({ id: 'existing-id' });

      await expect(useCase.execute(input)).rejects.toThrow(
        'Ya existe una ubicación con este código',
      );
      expect(mockLocationRepo.create).not.toHaveBeenCalled();
    });

    it('debe crear ubicación con dirección', async () => {
      const inputWithAddress = {
        ...input,
        address: {
          street: 'Av. Principal 123',
          city: 'Ciudad de México',
        },
      };

      mockLocationRepo.findByCode.mockResolvedValue(null);
      mockLocationRepo.create.mockImplementation(async (location) => location);

      const result = await useCase.execute(inputWithAddress);

      expect(result.address).toEqual(inputWithAddress.address);
    });
  });
});
