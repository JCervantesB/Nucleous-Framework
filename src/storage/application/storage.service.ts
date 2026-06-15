import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { STORAGE_CONFIG } from './storage.tokens';
import type {
  StorageProvider,
  UploadOptions,
  UploadResult,
  DeleteResult,
  GetUrlOptions,
  ListFilesOptions,
  ListFilesResult,
} from './storage.types';
import { StorageConfig } from '../infrastructure/config/storage.config';
import { LocalStorageService } from '../infrastructure/providers/local-storage.service';
import { UploadThingStorageService } from '../infrastructure/providers/uploadthing-storage.service';
import { CloudinaryStorageService } from '../infrastructure/providers/cloudinary-storage.service';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private provider: StorageProvider | null = null;

  constructor(
    @Inject(STORAGE_CONFIG) private readonly config: StorageConfig,
    private readonly localService: LocalStorageService,
    private readonly uploadthingService: UploadThingStorageService,
    private readonly cloudinaryService: CloudinaryStorageService,
  ) {}

  onModuleInit() {
    const providerType = this.config.getProvider();

    switch (providerType) {
      case 'uploadthing':
        this.provider = this.uploadthingService;
        break;
      case 'cloudinary':
        this.provider = this.cloudinaryService;
        break;
      case 'local':
      default:
        this.provider = this.localService;
        break;
    }

    this.logger.log(
      `StorageService inicializado con provider: ${providerType}`,
    );
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    if (!this.provider) {
      return { success: false, error: 'Storage provider no inicializado' };
    }
    return this.provider.upload(buffer, options);
  }

  async delete(key: string, bucket: string): Promise<DeleteResult> {
    if (!this.provider) {
      return { success: false, error: 'Storage provider no inicializado' };
    }
    return this.provider.delete(key, bucket);
  }

  async getUrl(
    key: string,
    bucket: string,
    options?: GetUrlOptions,
  ): Promise<string> {
    if (!this.provider) {
      throw new Error('Storage provider no inicializado');
    }
    return this.provider.getUrl(key, bucket, options);
  }

  async exists(key: string, bucket: string): Promise<boolean> {
    if (!this.provider) {
      return false;
    }
    return this.provider.exists(key, bucket);
  }

  async listFiles(options?: ListFilesOptions): Promise<ListFilesResult> {
    if (!this.provider) {
      return { success: false, error: 'Storage provider no inicializado' };
    }
    return this.provider.listFiles(options);
  }

  getProviderName(): string {
    return this.provider?.name ?? 'none';
  }
}

export type {
  StorageProvider,
  UploadOptions,
  UploadResult,
  DeleteResult,
  GetUrlOptions,
} from './storage.types';
