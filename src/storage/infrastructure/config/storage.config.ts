export type StorageProviderType = 'uploadthing' | 'cloudinary' | 'local';

export interface UploadthingConfig {
  appId: string;
  apiKey: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface LocalStorageConfig {
  basePath: string;
  baseUrl: string;
}

export interface StorageModuleConfig {
  enabled: boolean;
  provider: StorageProviderType;
  uploadthing?: UploadthingConfig;
  cloudinary?: CloudinaryConfig;
  local?: LocalStorageConfig;
}

export class StorageConfig {
  private constructor(private readonly config: StorageModuleConfig) {}

  static fromEnv(): StorageConfig {
    const enabled = process.env.STORAGE_ENABLED === 'true';
    const provider = (process.env.STORAGE_PROVIDER as StorageProviderType) ?? 'local';

    const config: StorageModuleConfig = {
      enabled,
      provider,
    };

    if (provider === 'uploadthing') {
      const appId = process.env.UPLOADTHING_APP_ID ?? '';
      const apiKey = process.env.UPLOADTHING_API_KEY ?? '';

      if (enabled && !appId) {
        throw new Error('STORAGE_PROVIDER=uploadthing requiere UPLOADTHING_APP_ID');
      }
      if (enabled && !apiKey) {
        throw new Error('STORAGE_PROVIDER=uploadthing requiere UPLOADTHING_API_KEY');
      }

      config.uploadthing = { appId, apiKey };
    }

    if (provider === 'cloudinary') {
      config.cloudinary = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
        apiKey: process.env.CLOUDINARY_API_KEY ?? '',
        apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
      };
    }

    if (provider === 'local') {
      config.local = {
        basePath: process.env.LOCAL_STORAGE_PATH ?? './uploads',
        baseUrl: process.env.LOCAL_STORAGE_BASE_URL ?? 'http://localhost:3000/uploads',
      };
    }

    return new StorageConfig(config);
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getProvider(): StorageProviderType {
    return this.config.provider;
  }

  getUploadthingConfig(): UploadthingConfig | undefined {
    return this.config.uploadthing;
  }

  getCloudinaryConfig(): CloudinaryConfig | undefined {
    return this.config.cloudinary;
  }

  getLocalConfig(): LocalStorageConfig | undefined {
    return this.config.local;
  }
}