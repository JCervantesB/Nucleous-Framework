import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage.service';
import type { ListFilesOptions, ListFilesResult } from '../storage.types';

export interface ListFilesInput {
  bucket?: string;
  prefix?: string;
}

@Injectable()
export class ListFilesUseCase {
  constructor(private readonly storageService: StorageService) {}

  async execute(input: ListFilesInput): Promise<ListFilesResult> {
    const options: ListFilesOptions = {
      bucket: input.bucket,
      prefix: input.prefix,
    };

    return this.storageService.listFiles(options);
  }
}
