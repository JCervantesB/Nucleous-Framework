import { Product, ProductType } from './product.entity';

describe('Product', () => {
  const businessId = 'business-123';
  const sku = 'PROD-001';
  const name = 'Camiseta Azul';
  const type: ProductType = 'storable';
  const basePrice = 29.99;

  describe('create', () => {
    it('debe crear un Product con valores requeridos', () => {
      const product = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
      });

      expect(product.id).toBeDefined();
      expect(product.businessId).toBe(businessId);
      expect(product.sku).toBe(sku);
      expect(product.name).toBe(name);
      expect(product.type).toBe(type);
      expect(product.basePrice).toBe(basePrice);
      expect(product.currencyCode).toBe('USD');
      expect(product.description).toBeNull();
      expect(product.categoryId).toBeNull();
      expect(product.isActive).toBe(true);
      expect(product.trackInventory).toBe(true);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeNull();
      expect(product.createdBy).toBeNull();
      expect(product.updatedBy).toBeNull();
    });

    it('debe crear un Product con todos los campos opcionales', () => {
      const categoryId = 'category-123';
      const description = 'Camiseta de algodón premium';
      const createdBy = 'user-123';

      const product = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
        description,
        categoryId,
        currencyCode: 'EUR',
        trackInventory: false,
        createdBy,
      });

      expect(product.description).toBe(description);
      expect(product.categoryId).toBe(categoryId);
      expect(product.currencyCode).toBe('EUR');
      expect(product.trackInventory).toBe(false);
      expect(product.createdBy).toBe(createdBy);
    });
  });

  describe('fromProps', () => {
    it('debe recrear un Product desde props', () => {
      const original = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
      });

      const recreated = Product.fromProps({
        id: original.id,
        businessId: original.businessId,
        sku: original.sku,
        name: original.name,
        description: original.description,
        type: original.type,
        categoryId: original.categoryId,
        basePrice: original.basePrice,
        currencyCode: original.currencyCode,
        isActive: original.isActive,
        trackInventory: original.trackInventory,
        createdAt: original.createdAt,
        updatedAt: original.updatedAt,
        createdBy: original.createdBy,
        updatedBy: original.updatedBy,
      });

      expect(recreated.id).toBe(original.id);
      expect(recreated.sku).toBe(original.sku);
      expect(recreated.name).toBe(original.name);
    });
  });

  describe('deactivate', () => {
    it('debe desactivar el producto', () => {
      const product = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
      });

      const deactivated = product.deactivate();

      expect(deactivated.isActive).toBe(false);
      expect(deactivated.updatedAt).toBeInstanceOf(Date);
    });

    it('no debe modificar el producto original', () => {
      const product = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
      });

      product.deactivate();

      expect(product.isActive).toBe(true);
      expect(product.updatedAt).toBeNull();
    });
  });

  describe('activate', () => {
    it('debe activar el producto', () => {
      const product = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
      });

      const deactivated = product.deactivate();
      const activated = deactivated.activate();

      expect(activated.isActive).toBe(true);
      expect(activated.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    it('debe actualizar los campos especificados', () => {
      const product = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
      });

      const updated = product.update({
        name: 'Camiseta Roja',
        basePrice: 39.99,
        description: 'Nueva descripción',
      });

      expect(updated.name).toBe('Camiseta Roja');
      expect(updated.basePrice).toBe(39.99);
      expect(updated.description).toBe('Nueva descripción');
      expect(updated.sku).toBe(sku);
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('debe permitir establecer categoryId a null', () => {
      const product = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
        categoryId: 'cat-123',
      });

      const updated = product.update({
        categoryId: null,
      });

      expect(updated.categoryId).toBeNull();
    });

    it('no debe modificar el producto original', () => {
      const product = Product.create({
        businessId,
        sku,
        name,
        type,
        basePrice,
      });

      product.update({ name: 'Nuevo nombre' });

      expect(product.name).toBe(name);
    });
  });
});
