import { ProductVariant } from './product-variant.entity';

describe('ProductVariant', () => {
  const productId = 'product-123';
  const sku = 'VAR-001';
  const name = 'Variante Roja Talla M';

  describe('create', () => {
    it('debe crear un ProductVariant con valores requeridos', () => {
      const variant = ProductVariant.create({
        productId,
        sku,
        name,
      });

      expect(variant.id).toBeDefined();
      expect(variant.productId).toBe(productId);
      expect(variant.sku).toBe(sku);
      expect(variant.name).toBe(name);
      expect(variant.priceModifier).toBe(0);
      expect(variant.attributes).toEqual({});
      expect(variant.isActive).toBe(true);
      expect(variant.createdAt).toBeInstanceOf(Date);
      expect(variant.updatedAt).toBeNull();
    });

    it('debe crear un ProductVariant con todos los campos', () => {
      const attributes = { color: 'rojo', talla: 'M' };
      const priceModifier = 5.0;

      const variant = ProductVariant.create({
        productId,
        sku,
        name,
        priceModifier,
        attributes,
      });

      expect(variant.priceModifier).toBe(priceModifier);
      expect(variant.attributes).toEqual(attributes);
    });
  });

  describe('fromProps', () => {
    it('debe recrear un ProductVariant desde props', () => {
      const original = ProductVariant.create({
        productId,
        sku,
        name,
      });

      const recreated = ProductVariant.fromProps({
        id: original.id,
        productId: original.productId,
        sku: original.sku,
        name: original.name,
        priceModifier: original.priceModifier,
        attributes: original.attributes,
        isActive: original.isActive,
        createdAt: original.createdAt,
        updatedAt: original.updatedAt,
      });

      expect(recreated.id).toBe(original.id);
      expect(recreated.sku).toBe(original.sku);
    });
  });

  describe('deactivate', () => {
    it('debe desactivar la variante', () => {
      const variant = ProductVariant.create({
        productId,
        sku,
        name,
      });

      const deactivated = variant.deactivate();

      expect(deactivated.isActive).toBe(false);
      expect(deactivated.updatedAt).toBeInstanceOf(Date);
    });

    it('no debe modificar la variante original', () => {
      const variant = ProductVariant.create({
        productId,
        sku,
        name,
      });

      variant.deactivate();

      expect(variant.isActive).toBe(true);
    });
  });

  describe('activate', () => {
    it('debe activar la variante', () => {
      const variant = ProductVariant.create({
        productId,
        sku,
        name,
      });

      const deactivated = variant.deactivate();
      const activated = deactivated.activate();

      expect(activated.isActive).toBe(true);
    });
  });

  describe('update', () => {
    it('debe actualizar los campos especificados', () => {
      const variant = ProductVariant.create({
        productId,
        sku,
        name,
      });

      const updated = variant.update({
        name: 'Variante Azul Talla L',
        priceModifier: 10.0,
        attributes: { color: 'azul', talla: 'L' },
      });

      expect(updated.name).toBe('Variante Azul Talla L');
      expect(updated.priceModifier).toBe(10.0);
      expect(updated.attributes).toEqual({ color: 'azul', talla: 'L' });
      expect(updated.sku).toBe(sku);
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('no debe modificar la variante original', () => {
      const variant = ProductVariant.create({
        productId,
        sku,
        name,
      });

      variant.update({ name: 'Nuevo nombre' });

      expect(variant.name).toBe(name);
    });
  });
});
