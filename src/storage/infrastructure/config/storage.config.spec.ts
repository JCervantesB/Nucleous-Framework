import { StorageConfig } from './storage.config';

describe('StorageConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('fromEnv', () => {
    it('debe usar provider local por defecto cuando STORAGE_PROVIDER no está definido', () => {
      delete process.env.STORAGE_ENABLED;
      delete process.env.STORAGE_PROVIDER;

      const config = StorageConfig.fromEnv();

      expect(config.isEnabled()).toBe(false);
      expect(config.getProvider()).toBe('local');
    });

    it('debe crear configuración con provider uploadthing cuando está definido', () => {
      process.env.STORAGE_ENABLED = 'true';
      process.env.STORAGE_PROVIDER = 'uploadthing';
      process.env.UPLOADTHING_APP_ID = 'test-app-id';
      process.env.UPLOADTHING_TOKEN = 'test-token';

      const config = StorageConfig.fromEnv();

      expect(config.isEnabled()).toBe(true);
      expect(config.getProvider()).toBe('uploadthing');
      expect(config.getUploadthingConfig()).toEqual({
        appId: 'test-app-id',
        token: 'test-token',
      });
    });

    it('debe crear configuración con provider cloudinary', () => {
      process.env.STORAGE_ENABLED = 'true';
      process.env.STORAGE_PROVIDER = 'cloudinary';
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
      process.env.CLOUDINARY_API_KEY = 'test-key';
      process.env.CLOUDINARY_API_SECRET = 'test-secret';

      const config = StorageConfig.fromEnv();

      expect(config.isEnabled()).toBe(true);
      expect(config.getProvider()).toBe('cloudinary');
      expect(config.getCloudinaryConfig()).toEqual({
        cloudName: 'test-cloud',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      });
    });

    it('debe crear configuración con provider local', () => {
      process.env.STORAGE_ENABLED = 'true';
      process.env.STORAGE_PROVIDER = 'local';
      process.env.LOCAL_STORAGE_PATH = '/custom/path';
      process.env.LOCAL_STORAGE_BASE_URL = 'https://custom.example.com/uploads';

      const config = StorageConfig.fromEnv();

      expect(config.isEnabled()).toBe(true);
      expect(config.getProvider()).toBe('local');
      expect(config.getLocalConfig()).toEqual({
        basePath: '/custom/path',
        baseUrl: 'https://custom.example.com/uploads',
      });
    });

    it('debe usar valores por defecto para local cuando no están definidos', () => {
      process.env.STORAGE_ENABLED = 'true';
      process.env.STORAGE_PROVIDER = 'local';
      delete process.env.LOCAL_STORAGE_PATH;
      delete process.env.LOCAL_STORAGE_BASE_URL;

      const config = StorageConfig.fromEnv();

      expect(config.getLocalConfig()).toEqual({
        basePath: './uploads',
        baseUrl: 'http://localhost:3000/uploads',
      });
    });

    it('debe lanzar error si provider es uploadthing pero falta UPLOADTHING_APP_ID', () => {
      process.env.STORAGE_ENABLED = 'true';
      process.env.STORAGE_PROVIDER = 'uploadthing';
      process.env.UPLOADTHING_TOKEN = 'test-token';
      delete process.env.UPLOADTHING_APP_ID;

      expect(() => StorageConfig.fromEnv()).toThrow(
        'STORAGE_PROVIDER=uploadthing requiere UPLOADTHING_APP_ID',
      );
    });

    it('debe lanzar error si provider es uploadthing pero falta UPLOADTHING_TOKEN', () => {
      process.env.STORAGE_ENABLED = 'true';
      process.env.STORAGE_PROVIDER = 'uploadthing';
      process.env.UPLOADTHING_APP_ID = 'test-app-id';
      delete process.env.UPLOADTHING_TOKEN;

      expect(() => StorageConfig.fromEnv()).toThrow(
        'STORAGE_PROVIDER=uploadthing requiere UPLOADTHING_TOKEN o UPLOADTHING_SECRET',
      );
    });
  });
});