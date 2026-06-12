import { Injectable, Inject, Logger } from '@nestjs/common';
import { STORAGE_SERVICE } from '../storage.tokens';
import type { StorageService, GetUrlOptions } from '../storage.service';

export interface GetFileUrlInput {
  key: string;
  bucket: string;
  options?: GetUrlOptions;
}

export interface GetFileUrlOutput {
  success: boolean;
  url?: string;
  error?: string;
}

@Injectable()
export class GetFileUrlUseCase {
  private readonly logger = new Logger(GetFileUrlUseCase.name);

  constructor(
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  async execute(input: GetFileUrlInput): Promise<GetFileUrlOutput> {
    try {
      const exists = await this.storageService.exists(input.key, input.bucket);
      if (!exists) {
        return { success: false, error: 'El archivo no existe' };
      }

      const url = await this.storageService.getUrl(input.key, input.bucket, input.options);

      return { success: true, url };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error en GetFileUrlUseCase: ${message}`);
      return { success: false, error: message };
    }
  }
}