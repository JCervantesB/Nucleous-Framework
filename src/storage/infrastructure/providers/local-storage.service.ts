import { Injectable, Inject, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { STORAGE_CONFIG } from '../../application/storage.tokens';
import type { StorageProvider, UploadOptions, UploadResult, DeleteResult, GetUrlOptions, ListFilesOptions, ListFilesResult } from '../../application/storage.types';
import { StoredFile } from '../../domain/value-objects/stored-file.vo';
import { StorageConfig } from '../config/storage.config';

@Injectable()
export class LocalStorageService implements StorageProvider {
  private readonly logger = new Logger(LocalStorageService.name);
  readonly name = 'local';

  constructor(@Inject(STORAGE_CONFIG) private readonly config: StorageConfig) {}

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const localConfig = this.config.getLocalConfig();
    if (!localConfig) {
      return { success: false, error: 'Configuración de almacenamiento local no encontrada' };
    }

    const filename = options.filename ?? `${crypto.randomUUID()}-${Date.now()}`;
    const folderPath = path.join(localConfig.basePath, options.bucket, options.folder ?? '');
    const fullPath = path.join(folderPath, filename);

    try {
      await fs.mkdir(folderPath, { recursive: true });
      await fs.writeFile(fullPath, buffer);

      const key = path.join(options.bucket, options.folder ?? '', filename).replace(/\\/g, '/');
      const url = `${localConfig.baseUrl}/${key}`;

      const storedFile = StoredFile.create({
        bucket: options.bucket,
        key,
        metadata: {
          size: buffer.length,
          mimeType: options.contentType ?? 'application/octet-stream',
          originalName: options.filename ?? filename,
          uploadedAt: new Date(),
        },
        url: {
          url,
          isSigned: false,
        },
      });

      this.logger.log(`Archivo guardado localmente: ${fullPath}`);
      return { success: true, file: storedFile };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error guardando archivo local: ${message}`);
      return { success: false, error: message };
    }
  }

  async delete(key: string, bucket: string): Promise<DeleteResult> {
    const localConfig = this.config.getLocalConfig();
    if (!localConfig) {
      return { success: false, error: 'Configuración de almacenamiento local no encontrada' };
    }

    const fullPath = path.join(localConfig.basePath, bucket, key);

    try {
      await fs.unlink(fullPath);
      this.logger.log(`Archivo eliminado localmente: ${fullPath}`);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error eliminando archivo local: ${message}`);
      return { success: false, error: message };
    }
  }

  async getUrl(key: string, bucket: string, options?: GetUrlOptions): Promise<string> {
    const localConfig = this.config.getLocalConfig();
    if (!localConfig) {
      throw new Error('Configuración de almacenamiento local no encontrada');
    }
    return `${localConfig.baseUrl}/${bucket}/${key}`;
  }

  async exists(key: string, bucket: string): Promise<boolean> {
    const localConfig = this.config.getLocalConfig();
    if (!localConfig) {
      return false;
    }

    const fullPath = path.join(localConfig.basePath, bucket, key);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(options?: ListFilesOptions): Promise<ListFilesResult> {
    const localConfig = this.config.getLocalConfig();
    if (!localConfig) {
      return { success: false, error: 'Configuración de almacenamiento local no encontrada' };
    }

    const bucketPath = path.join(localConfig.basePath, options?.bucket ?? '');
    const prefix = options?.prefix ?? '';

    try {
      const files: StoredFile[] = [];
      await this.walkDir(bucketPath, prefix, files, localConfig.baseUrl, options?.bucket);
      this.logger.log(`Listados ${files.length} archivos del almacenamiento local`);
      return { success: true, files };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error listando archivos locales: ${message}`);
      return { success: false, error: message };
    }
  }

  private async walkDir(dirPath: string, prefix: string, files: StoredFile[], baseUrl: string, bucket?: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(prefix, entry.name).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          await this.walkDir(fullPath, relativePath, files, baseUrl, bucket);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          const key = relativePath;
          const url = `${baseUrl}/${key}`;

          files.push(StoredFile.create({
            bucket: bucket ?? 'default',
            key,
            metadata: {
              size: stats.size,
              mimeType: 'application/octet-stream',
              originalName: entry.name,
              uploadedAt: stats.birthtime,
            },
            url: {
              url,
              isSigned: false,
            },
          }));
        }
      }
    } catch {
      // Directory doesn't exist or is empty
    }
  }
}