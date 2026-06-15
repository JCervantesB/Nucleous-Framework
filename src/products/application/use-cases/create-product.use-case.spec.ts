import {
  CreateProductUseCase,
  CreateProductInput,
} from './create-product.use-case';
import { Product, ProductType } from '../../domain/entities/product.entity';

const mockProductRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateProductUseCase(mockProductRepo);
  });

  describe('execute', () => {
    const businessId = 'business-123';
    const input: CreateProductInput = {
      businessId,
      sku: 'PROD-001',
      name: 'Camiseta Azul',
      type: 'storable',
      basePrice: 29.99,
    };

    it('debe crear un producto exitosamente', async () => {
      mockProductRepo.findBySku.mockResolvedValue(null);
      mockProductRepo.create.mockImplementation(async (product) => product);

      const result = await useCase.execute(input);

      expect(mockProductRepo.findBySku).toHaveBeenCalledWith(
        input.sku,
        input.businessId,
      );
      expect(mockProductRepo.create).toHaveBeenCalled();
      expect(result.product).toBeInstanceOf(Product);
      expect(result.product.sku).toBe(input.sku);
      expect(result.product.name).toBe(input.name);
    });

    it('debe lanzar error si el SKU ya existe', async () => {
      mockProductRepo.findBySku.mockResolvedValue(
        new Product({
          id: 'existing-id',
          businessId,
          sku: input.sku,
          name: 'Producto existente',
          description: null,
          type: 'storable' as ProductType,
          categoryId: null,
          basePrice: 19.99,
          currencyCode: 'USD',
          isActive: true,
          trackInventory: true,
          createdAt: new Date(),
          updatedAt: null,
          createdBy: null,
          updatedBy: null,
        }),
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        `Ya existe un producto con SKU: ${input.sku}`,
      );
      expect(mockProductRepo.create).not.toHaveBeenCalled();
    });

    it('debe crear producto con todos los campos opcionales', async () => {
      const inputWithExtras: CreateProductInput = {
        ...input,
        description: 'Camiseta de algodón',
        categoryId: 'cat-123',
        currencyCode: 'EUR',
        trackInventory: false,
        createdBy: 'user-123',
      };

      mockProductRepo.findBySku.mockResolvedValue(null);
      mockProductRepo.create.mockImplementation(async (product) => product);

      const result = await useCase.execute(inputWithExtras);

      expect(result.product.description).toBe('Camiseta de algodón');
      expect(result.product.categoryId).toBe('cat-123');
      expect(result.product.currencyCode).toBe('EUR');
      expect(result.product.trackInventory).toBe(false);
      expect(result.product.createdBy).toBe('user-123');
    });
  });
});
