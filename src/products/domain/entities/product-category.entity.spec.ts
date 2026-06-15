import { ProductCategory } from './product-category.entity';

describe('ProductCategory', () => {
  const businessId = 'business-123';
  const name = 'Camisetas';

  describe('create', () => {
    it('debe crear un ProductCategory con valores requeridos', () => {
      const category = ProductCategory.create({
        businessId,
        name,
      });

      expect(category.id).toBeDefined();
      expect(category.businessId).toBe(businessId);
      expect(category.name).toBe(name);
      expect(category.description).toBeNull();
      expect(category.parentId).toBeNull();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeNull();
    });

    it('debe crear un ProductCategory con campos opcionales', () => {
      const parentId = 'parent-category-123';
      const description = 'Categoría de camisetas para hombre';

      const category = ProductCategory.create({
        businessId,
        name,
        description,
        parentId,
      });

      expect(category.description).toBe(description);
      expect(category.parentId).toBe(parentId);
    });
  });

  describe('fromProps', () => {
    it('debe recrear un ProductCategory desde props', () => {
      const original = ProductCategory.create({
        businessId,
        name,
      });

      const recreated = ProductCategory.fromProps({
        id: original.id,
        businessId: original.businessId,
        name: original.name,
        description: original.description,
        parentId: original.parentId,
        isActive: original.isActive,
        createdAt: original.createdAt,
        updatedAt: original.updatedAt,
      });

      expect(recreated.id).toBe(original.id);
      expect(recreated.name).toBe(original.name);
    });
  });

  describe('deactivate', () => {
    it('debe desactivar la categoría', () => {
      const category = ProductCategory.create({
        businessId,
        name,
      });

      const deactivated = category.deactivate();

      expect(deactivated.isActive).toBe(false);
      expect(deactivated.updatedAt).toBeInstanceOf(Date);
    });

    it('no debe modificar la categoría original', () => {
      const category = ProductCategory.create({
        businessId,
        name,
      });

      category.deactivate();

      expect(category.isActive).toBe(true);
    });
  });

  describe('activate', () => {
    it('debe activar la categoría', () => {
      const category = ProductCategory.create({
        businessId,
        name,
      });

      const deactivated = category.deactivate();
      const activated = deactivated.activate();

      expect(activated.isActive).toBe(true);
    });
  });

  describe('update', () => {
    it('debe actualizar los campos especificados', () => {
      const category = ProductCategory.create({
        businessId,
        name,
      });

      const updated = category.update({
        name: 'Camisetas Premium',
        description: 'Nueva descripción',
      });

      expect(updated.name).toBe('Camisetas Premium');
      expect(updated.description).toBe('Nueva descripción');
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('debe permitir cambiar parentId a null', () => {
      const category = ProductCategory.create({
        businessId,
        name,
        parentId: 'old-parent',
      });

      const updated = category.update({
        parentId: null,
      });

      expect(updated.parentId).toBeNull();
    });

    it('no debe modificar la categoría original', () => {
      const category = ProductCategory.create({
        businessId,
        name,
      });

      category.update({ name: 'Nuevo nombre' });

      expect(category.name).toBe(name);
    });
  });
});
