import { UpdateProductUseCase } from './update-product.use-case';
import { Product, ProductType } from '../../domain/entities/product.entity';

const mockProductRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateProductUseCase(mockProductRepo);
  });

  describe('execute', () => {
    const businessId = 'business-123';
    const productId = 'product-123';

    it('debe actualizar un producto exitosamente', async () => {
      const product = Product.create({
        businessId,
        sku: 'PROD-001',
        name: 'Camiseta Azul',
        type: 'storable' as ProductType,
        basePrice: 29.99,
      });

      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.update.mockImplementation(async (p) => p);

      const result = await useCase.execute({
        id: productId,
        businessId,
        name: 'Camiseta Roja',
        basePrice: 39.99,
      });

      expect(mockProductRepo.findById).toHaveBeenCalledWith(productId, businessId);
      expect(mockProductRepo.update).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('debe lanzar error si el producto no existe', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          id: 'non-existent',
          businessId,
          name: 'Nuevo nombre',
        }),
      ).rejects.toThrow('Producto no encontrado');

      expect(mockProductRepo.update).not.toHaveBeenCalled();
    });

    it('debe actualizar solo los campos especificados', async () => {
      const product = Product.create({
        businessId,
        sku: 'PROD-001',
        name: 'Camiseta Azul',
        type: 'storable' as ProductType,
        basePrice: 29.99,
      });

      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.update.mockImplementation(async (p) => p);

      await useCase.execute({
        id: productId,
        businessId,
        name: 'Solo cambio el nombre',
      });

      const updatedProduct = mockProductRepo.update.mock.calls[0][0];
      expect(updatedProduct.name).toBe('Solo cambio el nombre');
      expect(updatedProduct.basePrice).toBe(29.99);
    });
  });
});
