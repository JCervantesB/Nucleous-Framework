import { Injectable, Inject, Logger } from '@nestjs/common';
import { STORAGE_SERVICE } from '../storage.tokens';
import type { StorageService } from '../storage.service';

export interface DeleteFileInput {
  key: string;
  bucket: string;
}

export interface DeleteFileOutput {
  success: boolean;
  error?: string;
}

@Injectable()
export class DeleteFileUseCase {
  private readonly logger = new Logger(DeleteFileUseCase.name);

  constructor(
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  async execute(input: DeleteFileInput): Promise<DeleteFileOutput> {
    try {
      const exists = await this.storageService.exists(input.key, input.bucket);
      if (!exists) {
        return { success: false, error: 'El archivo no existe' };
      }

      const result = await this.storageService.delete(input.key, input.bucket);

      if (result.success) {
        this.logger.log(`Archivo eliminado: ${input.bucket}/${input.key}`);
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error en DeleteFileUseCase: ${message}`);
      return { success: false, error: message };
    }
  }
}