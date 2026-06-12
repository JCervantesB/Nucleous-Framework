import type { StoredFile } from '../domain/value-objects/stored-file.vo';

export interface UploadOptions {
  bucket: string;
  folder?: string;
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  file?: StoredFile;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface GetUrlOptions {
  expiresIn?: number;
}

export interface StorageProvider {
  name: string;
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(key: string, bucket: string): Promise<DeleteResult>;
  getUrl(key: string, bucket: string, options?: GetUrlOptions): Promise<string>;
  exists(key: string, bucket: string): Promise<boolean>;
}

export interface StorageService {
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(key: string, bucket: string): Promise<DeleteResult>;
  getUrl(key: string, bucket: string, options?: GetUrlOptions): Promise<string>;
  exists(key: string, bucket: string): Promise<boolean>;
  getProviderName(): string;
}