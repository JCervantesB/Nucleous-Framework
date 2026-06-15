import { GetProductUseCase } from './get-product.use-case';
import { Product, ProductType } from '../../domain/entities/product.entity';

const mockProductRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetProductUseCase(mockProductRepo);
  });

  describe('execute', () => {
    const businessId = 'business-123';
    const productId = 'product-123';

    it('debe obtener un producto por ID', async () => {
      const product = Product.create({
        businessId,
        sku: 'PROD-001',
        name: 'Camiseta Azul',
        type: 'storable' as ProductType,
        basePrice: 29.99,
      });

      mockProductRepo.findById.mockResolvedValue(product);

      const result = await useCase.execute({ id: productId, businessId });

      expect(mockProductRepo.findById).toHaveBeenCalledWith(productId, businessId);
      expect(result.product).toBeInstanceOf(Product);
      expect(result.product?.id).toBe(product.id);
    });

    it('debe retornar null si el producto no existe', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      const result = await useCase.execute({ id: 'non-existent', businessId });

      expect(result.product).toBeNull();
    });
  });
});
