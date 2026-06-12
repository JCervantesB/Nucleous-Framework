import { Injectable, Inject, Logger } from '@nestjs/common';
import { UTApi } from 'uploadthing/server';
import { UTFile } from 'uploadthing/server';
import { STORAGE_CONFIG } from '../../application/storage.tokens';
import type { StorageProvider, UploadOptions, UploadResult, DeleteResult, GetUrlOptions } from '../../application/storage.service';
import { StoredFile } from '../../domain/value-objects/stored-file.vo';
import { StorageConfig } from '../config/storage.config';

@Injectable()
export class UploadThingStorageService implements StorageProvider {
  private readonly logger = new Logger(UploadThingStorageService.name);
  readonly name = 'uploadthing';
  private utApi: UTApi;

  constructor(@Inject(STORAGE_CONFIG) private readonly config: StorageConfig) {
    this.utApi = new UTApi();
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    try {
      const filename = options.filename ?? `${crypto.randomUUID()}-${Date.now()}`;

      const uint8Array = new Uint8Array(buffer);
      const file = new File([uint8Array], filename, {
        type: options.contentType ?? 'application/octet-stream',
      });

      const result = await this.utApi.uploadFiles(file);

      if ('error' in result && result.error) {
        this.logger.error(`Error de UploadThing: ${result.error.message}`);
        return { success: false, error: result.error.message };
      }

      const data = 'data' in result ? result.data : result;
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