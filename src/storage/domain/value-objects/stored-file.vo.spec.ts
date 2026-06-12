import { StoredFile, StoredFileUrl, StoredFileMetadata } from './stored-file.vo';

describe('StoredFile', () => {
  const createTestMetadata = (): StoredFileMetadata => ({
    size: 1024,
    mimeType: 'image/png',
    originalName: 'test-image.png',
    uploadedAt: new Date('2024-01-01'),
    businessId: 'business-123',
  });

  const createTestUrl = (): StoredFileUrl => ({
    url: 'https://example.com/uploads/image.png',
    isSigned: false,
  });

  describe('create', () => {
    it('debe crear un StoredFile con id generado', () => {
      const file = StoredFile.create({
        bucket: 'products',
        key: 'products/image.png',
        metadata: createTestMetadata(),
        url: createTestUrl(),
      });

      expect(file.id).toBeDefined();
      expect(file.bucket).toBe('products');
      expect(file.key).toBe('products/image.png');
    });

    it('debe crear un StoredFile con id personalizado', () => {
      const file = StoredFile.create({
        id: 'custom-id-123',
        bucket: 'products',
        key: 'products/image.png',
        metadata: createTestMetadata(),
        url: createTestUrl(),
      });

      expect(file.id).toBe('custom-id-123');
    });

    it('debe exponer metadata correctamente', () => {
      const file = StoredFile.create({
        bucket: 'products',
        key: 'products/image.png',
        metadata: createTestMetadata(),
        url: createTestUrl(),
      });

      expect(file.size).toBe(1024);
      expect(file.mimeType).toBe('image/png');
      expect(file.originalName).toBe('test-image.png');
      expect(file.businessId).toBe('business-123');
    });
  });

  describe('fromProps', () => {
    it('debe recrear un StoredFile desde props', () => {
      const original = StoredFile.create({
        bucket: 'products',
        key: 'products/image.png',
        metadata: createTestMetadata(),
        url: createTestUrl(),
      });

      const recreated = StoredFile.fromProps({
        id: original.id,
        bucket: original.bucket,
        key: original.key,
        metadata: original.metadata,
        url: original.url,
      });

      expect(recreated.id).toBe(original.id);
      expect(recreated.bucket).toBe(original.bucket);
      expect(recreated.key).toBe(original.key);
    });
  });

  describe('helpers', () => {
    it('debe retornar la URL pública', () => {
      const file = StoredFile.create({
        bucket: 'products',
        key: 'products/image.png',
        metadata: createTestMetadata(),
        url: createTestUrl(),
      });

      expect(file.publicUrl).toBe('https://example.com/uploads/image.png');
    });

    it('debe indicar si está expirado (sin fecha de expiración)', () => {
      const file = StoredFile.create({
        bucket: 'products',
        key: 'products/image.png',
        metadata: createTestMetadata(),
        url: createTestUrl(),
      });

      expect(file.isExpired).toBe(false);
    });

    it('debe indicar si está expirado (con fecha futura)', () => {
      const file = StoredFile.fromProps({
        id: 'test',
        bucket: 'products',
        key: 'products/image.png',
        metadata: createTestMetadata(),
        url: {
          url: 'https://example.com/image.png',
          expiresAt: new Date('2030-01-01'),
          isSigned: true,
        },
      });

      expect(file.isExpired).toBe(false);
    });

    it('debe indicar si está expirado (con fecha pasada)', () => {
      const file = StoredFile.fromProps({
        id: 'test',
        bucket: 'products',
        key: 'products/image.png',
        metadata: createTestMetadata(),
        url: {
          url: 'https://example.com/image.png',
          expiresAt: new Date('2020-01-01'),
          isSigned: true,
        },
      });

      expect(file.isExpired).toBe(true);
    });
  });
});