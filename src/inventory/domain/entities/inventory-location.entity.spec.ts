import { InventoryLocation, LocationType } from './inventory-location.entity';

describe('InventoryLocation', () => {
  const businessId = 'business-123';

  describe('create', () => {
    it('debe crear una ubicación con valores por defecto', () => {
      const location = InventoryLocation.create({
        businessId,
        code: 'WH-001',
        name: 'Almacén Central',
        type: 'INTERNAL',
      });

      expect(location.id).toBeDefined();
      expect(location.businessId).toBe(businessId);
      expect(location.code).toBe('WH-001');
      expect(location.name).toBe('Almacén Central');
      expect(location.type).toBe('INTERNAL');
      expect(location.isActive).toBe(true);
      expect(location.isTransit).toBe(false);
      expect(location.contactId).toBeNull();
      expect(location.address).toBeNull();
    });

    it('debe crear una ubicación tipo TRANSIT con isTransit true', () => {
      const location = InventoryLocation.create({
        businessId,
        code: 'TRANSIT-001',
        name: 'Ubicación de Tránsito',
        type: 'TRANSIT',
      });

      expect(location.isTransit).toBe(true);
    });

    it('debe crear una ubicación con dirección', () => {
      const address = {
        street: 'Av. Principal 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '06600',
        countryCode: 'MX',
      };

      const location = InventoryLocation.create({
        businessId,
        code: 'WH-002',
        name: 'Sucursal Norte',
        type: 'INTERNAL',
        address,
        contactId: 'contact-123',
      });

      expect(location.address).toEqual(address);
      expect(location.contactId).toBe('contact-123');
    });
  });

  describe('fromProps', () => {
    it('debe crear una ubicación desde props', () => {
      const props = {
        id: 'location-id',
        businessId,
        code: 'WH-001',
        name: 'Almacén Central',
        type: 'INTERNAL' as LocationType,
        contactId: null,
        address: null,
        isActive: true,
        isTransit: false,
        createdAt: new Date(),
        updatedAt: null,
        createdBy: 'user-123',
        updatedBy: null,
      };

      const location = InventoryLocation.fromProps(props);

      expect(location.id).toBe(props.id);
      expect(location.code).toBe(props.code);
    });
  });

  describe('activate/deactivate', () => {
    it('debe activar una ubicación', () => {
      const location = InventoryLocation.create({
        businessId,
        code: 'WH-001',
        name: 'Almacén',
        type: 'INTERNAL',
      });

      const deactivated = location.deactivate();
      expect(deactivated.isActive).toBe(false);
      expect(deactivated.updatedAt).toBeDefined();

      const activated = deactivated.activate();
      expect(activated.isActive).toBe(true);
    });
  });

  describe('update', () => {
    it('debe actualizar campos específicos', () => {
      const location = InventoryLocation.create({
        businessId,
        code: 'WH-001',
        name: 'Almacén Central',
        type: 'INTERNAL',
      });

      const updated = location.update({
        name: 'Almacén Norte',
        type: 'SUPPLIER',
      });

      expect(updated.name).toBe('Almacén Norte');
      expect(updated.type).toBe('SUPPLIER');
      expect(updated.code).toBe('WH-001');
      expect(updated.updatedAt).toBeDefined();
    });

    it('debe cambiar isTransit al actualizar tipo a TRANSIT', () => {
      const location = InventoryLocation.create({
        businessId,
        code: 'WH-001',
        name: 'Almacén',
        type: 'INTERNAL',
      });

      expect(location.isTransit).toBe(false);

      const updated = location.update({ type: 'TRANSIT' });
      expect(updated.isTransit).toBe(true);
    });
  });
});
