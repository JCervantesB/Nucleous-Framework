import { Injectable, Inject, Logger } from '@nestjs/common';
import { UTApi } from 'uploadthing/server';
import { UTFile } from 'uploadthing/server';
import { STORAGE_CONFIG } from '../../application/storage.tokens';
import type { StorageProvider, UploadOptions, UploadResult, DeleteResult, GetUrlOptions } from '../../application/storage.types';
import { StoredFile } from '../../domain/value-objects/stored-file.vo';
import { StorageConfig } from '../config/storage.config';

@Injectable()
export class UploadThingStorageService implements StorageProvider {
  private readonly logger = new Logger(UploadThingStorageService.name);
  readonly name = 'uploadthing';
  private utApi: UTApi;

  constructor(@Inject(STORAGE_CONFIG) private readonly config: StorageConfig) {
    const uploadthingConfig = this.config.getUploadthingConfig();
    if (uploadthingConfig?.token) {
      this.utApi = new UTApi({ token: uploadthingConfig.token });
    } else {
      this.utApi = new UTApi();
    }
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    try {
      const filename = options.filename ?? `${crypto.randomUUID()}-${Date.now()}`;

      const uint8Array = new Uint8Array(buffer);
      const utFile = new UTFile([uint8Array], filename, {
        type: options.contentType ?? 'application/octet-stream',
      });

      const results = await this.utApi.uploadFiles([utFile]);
      const firstResult = results[0];

      if (!firstResult || ('error' in firstResult && firstResult.error)) {
        const errorMsg = 'error' in firstResult ? firstResult.error?.message : 'Upload failed';
        this.logger.error(`Error de UploadThing: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      const data = firstResult.data;
      const storedFile = StoredFile.create({
        bucket: options.bucket,
        key: data.key,
        metadata: {
          size: data.size,
          mimeType: data.type,
          originalName: filename,
          uploadedAt: new Date(),
        },
        url: {
          url: data.url,
          isSigned: false,
        },
      });

      this.logger.log(`Archivo subido a UploadThing: ${data.key}`);
      return { success: true, file: storedFile };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error subiendo a UploadThing: ${message}`);
      return { success: false, error: message };
    }
  }

  async delete(key: string, bucket: string): Promise<DeleteResult> {
    try {
      await this.utApi.deleteFiles(key);
      this.logger.log(`Archivo eliminado de UploadThing: ${bucket}/${key}`);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error eliminando de UploadThing: ${message}`);
      return { success: false, error: message };
    }
  }

  async getUrl(key: string, bucket: string, options?: GetUrlOptions): Promise<string> {
    try {
      const result = await this.utApi.getSignedURL(key, {
        expiresIn: options?.expiresIn ?? 3600,
      });
      if (typeof result === 'string') {
        return result;
      }
      return result.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error obteniendo URL de UploadThing: ${message}`);
    }
  }

  async exists(key: string, bucket: string): Promise<boolean> {
    try {
      const result = await this.utApi.getSignedURL(key);
      return !!result;
    } catch {
      return false;
    }
  }
}