import { Injectable, Inject, Logger } from '@nestjs/common';
import { STORAGE_SERVICE } from '../storage.tokens';
import type { StorageService } from '../storage.service';
import type { StoredFile } from '../../domain/value-objects/stored-file.vo';

export interface UploadFileInput {
  businessId?: string;
  buffer: Buffer;
  bucket: string;
  folder?: string;
  filename?: string;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface UploadFileOutput {
  success: boolean;
  file?: StoredFile;
  error?: string;
}

@Injectable()
export class UploadFileUseCase {
  private readonly logger = new Logger(UploadFileUseCase.name);

  constructor(
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  async execute(input: UploadFileInput): Promise<UploadFileOutput> {
    try {
      const result = await this.storageService.upload(input.buffer, {
        bucket: input.bucket,
        folder: input.folder,
        filename: input.filename,
        contentType: input.contentType,
        metadata: {
          ...input.metadata,
          businessId: input.businessId ?? '',
        },
      });

      if (result.success && result.file) {
        this.logger.log(`Archivo subido: ${result.file.key} en bucket ${input.bucket}`);
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error en UploadFileUseCase: ${message}`);
      return { success: false, error: message };
    }
  }
}