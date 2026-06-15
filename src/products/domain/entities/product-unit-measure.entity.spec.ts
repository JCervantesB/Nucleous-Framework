import { ProductUnitMeasure, UnitType } from './product-unit-measure.entity';

describe('ProductUnitMeasure', () => {
  const businessId = 'business-123';
  const name = 'Kilogramo';
  const abbreviation = 'kg';
  const type: UnitType = 'weight';

  describe('create', () => {
    it('debe crear un ProductUnitMeasure con valores requeridos', () => {
      const unit = ProductUnitMeasure.create({
        businessId,
        name,
        abbreviation,
        type,
      });

      expect(unit.id).toBeDefined();
      expect(unit.businessId).toBe(businessId);
      expect(unit.name).toBe(name);
      expect(unit.abbreviation).toBe(abbreviation);
      expect(unit.type).toBe(type);
      expect(unit.conversionFactor).toBe(1);
      expect(unit.isDefault).toBe(false);
      expect(unit.createdAt).toBeInstanceOf(Date);
      expect(unit.updatedAt).toBeNull();
    });

    it('debe crear un ProductUnitMeasure con campos opcionales', () => {
      const unit = ProductUnitMeasure.create({
        businessId,
        name,
        abbreviation,
        type,
        conversionFactor: 1000,
        isDefault: true,
      });

      expect(unit.conversionFactor).toBe(1000);
      expect(unit.isDefault).toBe(true);
    });
  });

  describe('fromProps', () => {
    it('debe recrear un ProductUnitMeasure desde props', () => {
      const original = ProductUnitMeasure.create({
        businessId,
        name,
        abbreviation,
        type,
      });

      const recreated = ProductUnitMeasure.fromProps({
        id: original.id,
        businessId: original.businessId,
        name: original.name,
        abbreviation: original.abbreviation,
        type: original.type,
        conversionFactor: original.conversionFactor,
        isDefault: original.isDefault,
        createdAt: original.createdAt,
        updatedAt: original.updatedAt,
      });

      expect(recreated.id).toBe(original.id);
      expect(recreated.name).toBe(original.name);
    });
  });

  describe('update', () => {
    it('debe actualizar los campos especificados', () => {
      const unit = ProductUnitMeasure.create({
        businessId,
        name,
        abbreviation,
        type,
      });

      const updated = unit.update({
        name: 'Gramo',
        abbreviation: 'g',
        conversionFactor: 1,
        isDefault: true,
      });

      expect(updated.name).toBe('Gramo');
      expect(updated.abbreviation).toBe('g');
      expect(updated.conversionFactor).toBe(1);
      expect(updated.isDefault).toBe(true);
      expect(updated.type).toBe(type);
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('no debe modificar la unidad original', () => {
      const unit = ProductUnitMeasure.create({
        businessId,
        name,
        abbreviation,
        type,
      });

      unit.update({ name: 'Nuevo nombre' });

      expect(unit.name).toBe(name);
    });
  });
});
