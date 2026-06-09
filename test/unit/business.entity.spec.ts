import { Business } from '../../src/core/domain/entities/business.entity';

describe('Business Entity', () => {
  describe('create', () => {
    it('debe crear una entidad con id generado', () => {
      const business = Business.create({
        name: 'Mi Empresa',
        slug: 'mi-empresa',
      });

      expect(business.id).toBeDefined();
      expect(typeof business.id).toBe('string');
      expect(business.id.length).toBeGreaterThan(0);
    });

    it('debe crear con los campos esperados', () => {
      const business = Business.create({
        name: 'Test Business',
        slug: 'test-business',
        legalName: 'Test Business SA',
        countryCode: 'MX',
        timezone: 'America/Mexico_City',
        currencyCode: 'MXN',
        publicName: 'Test',
      });

      expect(business.name).toBe('Test Business');
      expect(business.slug).toBe('test-business');
      expect(business.legalName).toBe('Test Business SA');
      expect(business.countryCode).toBe('MX');
      expect(business.timezone).toBe('America/Mexico_City');
      expect(business.currencyCode).toBe('MXN');
      expect(business.publicName).toBe('Test');
    });

    it('debe establecer isActive en true por defecto', () => {
      const business = Business.create({
        name: 'Activo',
        slug: 'activo',
      });

      expect(business.isActive).toBe(true);
    });

    it('debe establecer createdAt con fecha actual', () => {
      const before = new Date();
      const business = Business.create({
        name: 'Fecha Test',
        slug: 'fecha-test',
      });
      const after = new Date();

      expect(business.createdAt).toBeInstanceOf(Date);
      expect(business.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(business.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('debe establecer updatedAt en null', () => {
      const business = Business.create({
        name: 'Sin Update',
        slug: 'sin-update',
      });

      expect(business.updatedAt).toBeNull();
    });

    it('debe permitir campos opcionales nulos', () => {
      const business = Business.create({
        name: 'Minimal',
        slug: 'minimal',
      });

      expect(business.legalName).toBeNull();
      expect(business.countryCode).toBeNull();
      expect(business.timezone).toBeNull();
      expect(business.currencyCode).toBeNull();
      expect(business.publicName).toBeNull();
    });

    it('debe mantener slug como se proporciona', () => {
      const business = Business.create({
        name: 'Normalizado',
        slug: 'SLUG-NORMALIZADO',
      });

      expect(business.slug).toBe('SLUG-NORMALIZADO');
    });
  });

  describe('fromProps', () => {
    it('debe crear entidad desde props existentes', () => {
      const props = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'From Props',
        legalName: 'Legal',
        slug: 'from-props',
        countryCode: 'US',
        timezone: 'America/New_York',
        currencyCode: 'USD',
        publicName: 'Public',
        isActive: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
      };

      const business = Business.fromProps(props);

      expect(business.id).toBe(props.id);
      expect(business.name).toBe(props.name);
      expect(business.slug).toBe(props.slug);
      expect(business.isActive).toBe(props.isActive);
      expect(business.createdAt).toEqual(props.createdAt);
      expect(business.updatedAt).toEqual(props.updatedAt);
    });

    it('debe manejar updatedAt null', () => {
      const props = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'No Update',
        legalName: null,
        slug: 'no-update',
        countryCode: null,
        timezone: null,
        currencyCode: null,
        publicName: null,
        isActive: false,
        createdAt: new Date(),
        updatedAt: null,
      };

      const business = Business.fromProps(props);

      expect(business.updatedAt).toBeNull();
      expect(business.isActive).toBe(false);
    });
  });

  describe('getters', () => {
    it('debe exponer todos los campos correctamente', () => {
      const props = {
        id: 'test-id-123',
        name: 'Getters Test',
        legalName: 'Legal Name',
        slug: 'getters-test',
        countryCode: 'MX',
        timezone: 'America/Mexico_City',
        currencyCode: 'MXN',
        publicName: 'Public Name',
        isActive: true,
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-20'),
      };

      const business = Business.fromProps(props);

      expect(business.id).toBe('test-id-123');
      expect(business.name).toBe('Getters Test');
      expect(business.legalName).toBe('Legal Name');
      expect(business.slug).toBe('getters-test');
      expect(business.countryCode).toBe('MX');
      expect(business.timezone).toBe('America/Mexico_City');
      expect(business.currencyCode).toBe('MXN');
      expect(business.publicName).toBe('Public Name');
      expect(business.isActive).toBe(true);
      expect(business.createdAt).toEqual(new Date('2026-01-15'));
      expect(business.updatedAt).toEqual(new Date('2026-01-20'));
    });
  });
});