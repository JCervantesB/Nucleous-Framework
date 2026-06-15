import { ListProductsUseCase } from './list-products.use-case';
import { Product, ProductType } from '../../domain/entities/product.entity';

const mockProductRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListProductsUseCase(mockProductRepo);
  });

  describe('execute', () => {
    const businessId = 'business-123';

    it('debe listar productos con paginación por defecto', async () => {
      const products = [
        Product.create({
          businessId,
          sku: 'PROD-001',
          name: 'Producto 1',
          type: 'storable' as ProductType,
          basePrice: 10,
        }),
        Product.create({
          businessId,
          sku: 'PROD-002',
          name: 'Producto 2',
          type: 'consumable' as ProductType,
          basePrice: 20,
        }),
      ];

      mockProductRepo.list.mockResolvedValue({ data: products, total: 2 });

      const result = await useCase.execute({ businessId });

      expect(mockProductRepo.list).toHaveBeenCalledWith(businessId, undefined);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('debe usar opciones de paginación personalizadas', async () => {
      mockProductRepo.list.mockResolvedValue({ data: [], total: 0 });

      await useCase.execute({
        businessId,
        options: { page: 2, pageSize: 10, search: 'camiseta' },
      });

      expect(mockProductRepo.list).toHaveBeenCalledWith(businessId, {
        page: 2,
        pageSize: 10,
        search: 'camiseta',
      });
    });

    it('debe retornar lista vacía cuando no hay productos', async () => {
      mockProductRepo.list.mockResolvedValue({ data: [], total: 0 });

      const result = await useCase.execute({ businessId });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
