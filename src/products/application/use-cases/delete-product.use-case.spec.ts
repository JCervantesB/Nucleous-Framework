import { DeleteProductUseCase } from './delete-product.use-case';
import { Product, ProductType } from '../../domain/entities/product.entity';

const mockProductRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteProductUseCase(mockProductRepo);
  });

  describe('execute', () => {
    const businessId = 'business-123';
    const productId = 'product-123';

    it('debe eliminar un producto exitosamente', async () => {
      const product = Product.create({
        businessId,
        sku: 'PROD-001',
        name: 'Camiseta Azul',
        type: 'storable' as ProductType,
        basePrice: 29.99,
      });

      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.delete.mockResolvedValue(undefined);

      const result = await useCase.execute({ id: productId, businessId });

      expect(mockProductRepo.findById).toHaveBeenCalledWith(productId, businessId);
      expect(mockProductRepo.delete).toHaveBeenCalledWith(productId, businessId);
      expect(result.success).toBe(true);
    });

    it('debe lanzar error si el producto no existe', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ id: 'non-existent', businessId }),
      ).rejects.toThrow('Producto no encontrado');

      expect(mockProductRepo.delete).not.toHaveBeenCalled();
    });
  });
});
