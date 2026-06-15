import { Injectable, Inject, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { STORAGE_CONFIG } from '../../application/storage.tokens';
import type {
  StorageProvider,
  UploadOptions,
  UploadResult,
  DeleteResult,
  GetUrlOptions,
  ListFilesOptions,
  ListFilesResult,
} from '../../application/storage.types';
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
      return {
        success: false,
        error: 'Configuración de Cloudinary no encontrada',
      };
    }

    return new Promise((resolve) => {
      const folder = `${options.bucket}/${options.folder ?? ''}`.replace(
        /\/+$/,
        '',
      );
      const filename =
        options.filename ?? `${crypto.randomUUID()}-${Date.now()}`;

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
            resolve({
              success: false,
              error: 'No se recibió respuesta de Cloudinary',
            });
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

  async getUrl(
    key: string,
    bucket: string,
    options?: GetUrlOptions,
  ): Promise<string> {
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

  async listFiles(options?: ListFilesOptions): Promise<ListFilesResult> {
    const cloudinaryConfig = this.config.getCloudinaryConfig();
    if (!cloudinaryConfig) {
      return {
        success: false,
        error: 'Configuración de Cloudinary no encontrada',
      };
    }

    try {
      const folder =
        `${options?.bucket ?? 'default'}/${options?.prefix ?? ''}`.replace(
          /\/+$/,
          '',
        );
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder || undefined,
        max_results: 100,
      });

      const files = (result.resources as any[]).map((resource: any) => {
        const url = resource.secure_url;
        const isSigned = resource.signature;

        return StoredFile.create({
          bucket: options?.bucket ?? 'default',
          key: resource.public_id,
          metadata: {
            size: resource.bytes,
            mimeType: resource.format,
            originalName:
              resource.original_filename ??
              resource.public_id.split('/').pop() ??
              '',
            uploadedAt: new Date(resource.created_at),
          },
          url: {
            url,
            isSigned: !!isSigned,
          },
        });
      });

      this.logger.log(`Listados ${files.length} archivos de Cloudinary`);
      return { success: true, files };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error listando archivos en Cloudinary: ${message}`);
      return { success: false, error: message };
    }
  }
}
