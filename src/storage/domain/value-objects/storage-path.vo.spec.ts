import { StoragePath } from './storage-path.vo';

describe('StoragePath', () => {
  describe('create', () => {
    it('debe crear una ruta con bucket y filename', () => {
      const path = StoragePath.create('products', 'image.jpg');

      expect(path.path).toBe('products/image.jpg');
      expect(path.bucket).toBe('products');
      expect(path.filename).toBe('image.jpg');
    });

    it('debe crear una ruta con bucket, folder y filename', () => {
      const path = StoragePath.create('products', '2024', 'image.jpg');

      expect(path.path).toBe('products/2024/image.jpg');
      expect(path.bucket).toBe('products');
      expect(path.folder).toBe('products/2024');
      expect(path.filename).toBe('image.jpg');
    });

    it('debe normalizar rutas múltiples barras', () => {
      const path = StoragePath.create('products', '2024', 'image.jpg');

      expect(path.path).toBe('products/2024/image.jpg');
    });

    it('debe ignorar partes vacías', () => {
      const path = StoragePath.create('products', '', 'image.jpg');

      expect(path.path).toBe('products/image.jpg');
    });
  });

  describe('fromUrl', () => {
    it('debe extraer path de una URL', () => {
      const url = 'https://example.com/uploads/products/image.jpg';
      const path = StoragePath.fromUrl(url);

      expect(path).toBeTruthy();
      expect(path!.path).toBe('uploads/products/image.jpg');
    });

    it('debe retornar null para URL inválida', () => {
      const path = StoragePath.fromUrl('not-a-url');

      expect(path).toBeNull();
    });
  });

  describe('fromKey', () => {
    it('debe crear StoragePath desde una key', () => {
      const path = StoragePath.fromKey('products/2024/image.jpg');

      expect(path.path).toBe('products/2024/image.jpg');
      expect(path.bucket).toBe('products');
      expect(path.filename).toBe('image.jpg');
    });
  });

  describe('getters', () => {
    it('debe retornar las partes correctamente', () => {
      const path = StoragePath.create('products', '2024', 'image.jpg');

      expect(path.parts).toEqual(['products', '2024', 'image.jpg']);
    });

    it('debe retornar bucket vacío si no hay partes', () => {
      const path = StoragePath.fromKey('');

      expect(path.bucket).toBe('');
    });

    it('debe retornar filename vacío si no hay partes', () => {
      const path = StoragePath.fromKey('');

      expect(path.filename).toBe('');
    });
  });

  describe('toString', () => {
    it('debe retornar el path como string', () => {
      const path = StoragePath.create('products', 'image.jpg');

      expect(path.toString()).toBe('products/image.jpg');
    });
  });
});