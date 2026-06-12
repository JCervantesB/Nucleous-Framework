import { Injectable, Inject, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { STORAGE_CONFIG } from '../../application/storage.tokens';
import type { StorageProvider, UploadOptions, UploadResult, DeleteResult, GetUrlOptions } from '../../application/storage.types';
import { StoredFile } from '../../domain/value-objects/stored-file.vo';
import { StorageConfig } from '../config/storage.config';

@Injectable()
export class CloudinaryStorageService implements StorageProvider {
  private readonly logger = new Logger(CloudinaryStorageService.name);
  readonly name = 'cloudinary';

  constructor(@Inject(STORAGE_CONFIG) private readonly config: StorageConfig) {
    const cloudinaryConfig = this.config.getCloudinaryConfig();
    if (cloudinaryConfig) {
      cloudinary.config({
        cloud_name: cloudinaryConfig.cloudName,
        api_key: cloudinaryConfig.apiKey,
        api_secret: cloudinaryConfig.apiSecret,
      });
    }
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const cloudinaryConfig = this.config.getCloudinaryConfig();
    if (!cloudinaryConfig) {
      return { success: false, error: 'Configuración de Cloudinary no encontrada' };
    }

    return new Promise((resolve) => {
      const folder = `${options.bucket}/${options.folder ?? ''}`.replace(/\/+$/, '');
      const filename = options.filename ?? `${crypto.randomUUID()}-${Date.now()}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.replace(/\.[^.]+$/, ''),
          resource_type: 'auto',
          mimeType: options.contentType,
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Error subiendo a Cloudinary: ${error.message}`);
            resolve({ success: false, error: error.message });
            return;
          }

          if (!result) {
            resolve({ success: false, error: 'No se recibió respuesta de Cloudinary' });
            return;
          }

          const storedFile = StoredFile.create({
            bucket: options.bucket,
            key: result.public_id,
            metadata: {
              size: result.bytes,
              mimeType: result.format,
              originalName: options.filename ?? filename,
              uploadedAt: new Date(result.created_at),
            },
            url: {
              url: result.secure_url,
              isSigned: false,
            },
          });

          this.logger.log(`Archivo subido a Cloudinary: ${result.public_id}`);
          resolve({ success: true, file: storedFile });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async delete(key: string, bucket: string): Promise<DeleteResult> {
    try {
      await cloudinary.uploader.destroy(key);
      this.logger.log(`Archivo eliminado de Cloudinary: ${bucket}/${key}`);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error eliminando de Cloudinary: ${message}`);
      return { success: false, error: message };
    }
  }

  async getUrl(key: string, bucket: string, options?: GetUrlOptions): Promise<string> {
    try {
      const result = cloudinary.url(key, {
        secure: true,
        sign_url: !!options?.expiresIn,
        expires_in: options?.expiresIn,
      });
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error obteniendo URL de Cloudinary: ${message}`);
    }
  }

  async exists(key: string, bucket: string): Promise<boolean> {
    try {
      const result = await cloudinary.api.resource(key, {
        resource_type: 'auto',
      });
      return !!result;
    } catch {
      return false;
    }
  }
}