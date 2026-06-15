import { StorageBucket, WellKnownBucket } from './storage-bucket.vo';

describe('StorageBucket', () => {
  describe('create', () => {
    it('debe crear un bucket con nombre en minúsculas', () => {
      const bucket = StorageBucket.create('PRODUCTS');

      expect(bucket.name).toBe('products');
      expect(bucket.isPublic).toBe(true);
    });

    it('debe crear un bucket privado', () => {
      const bucket = StorageBucket.create('Documents', false);

      expect(bucket.name).toBe('documents');
      expect(bucket.isPublic).toBe(false);
    });

    it('debe lanzar error si el nombre está vacío', () => {
      expect(() => StorageBucket.create('')).toThrow(
        'El nombre del bucket no puede estar vacío',
      );
    });

    it('debe lanzar error si el nombre solo tiene espacios', () => {
      expect(() => StorageBucket.create('   ')).toThrow(
        'El nombre del bucket no puede estar vacío',
      );
    });
  });

  describe('well known buckets', () => {
    it('debe crear bucket de avatars público', () => {
      const bucket = StorageBucket.avatars();

      expect(bucket.name).toBe('avatars');
      expect(bucket.isPublic).toBe(true);
    });

    it('debe crear bucket de products público', () => {
      const bucket = StorageBucket.products();

      expect(bucket.name).toBe('products');
      expect(bucket.isPublic).toBe(true);
    });

    it('debe crear bucket de documents privado', () => {
      const bucket = StorageBucket.documents();

      expect(bucket.name).toBe('documents');
      expect(bucket.isPublic).toBe(false);
    });

    it('debe crear bucket de backups privado', () => {
      const bucket = StorageBucket.backups();

      expect(bucket.name).toBe('backups');
      expect(bucket.isPublic).toBe(false);
    });

    it('debe crear bucket desde WellKnownBucket enum', () => {
      const bucket = StorageBucket.fromWellKnown(WellKnownBucket.AVATARS);

      expect(bucket.name).toBe('avatars');
      expect(bucket.isPublic).toBe(true);
    });
  });

  describe('toString', () => {
    it('debe retornar el nombre del bucket', () => {
      const bucket = StorageBucket.create('Products');

      expect(bucket.toString()).toBe('products');
    });
  });
});
