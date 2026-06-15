import { Module, Global } from '@nestjs/common';
import { STORAGE_CONFIG, STORAGE_SERVICE } from './application/storage.tokens';
import { StorageConfig } from './infrastructure/config/storage.config';
import { StorageService } from './application/storage.service';
import { UploadThingStorageService } from './infrastructure/providers/uploadthing-storage.service';
import { CloudinaryStorageService } from './infrastructure/providers/cloudinary-storage.service';
import { LocalStorageService } from './infrastructure/providers/local-storage.service';
import { UploadFileUseCase } from './application/use-cases/upload-file.use-case';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { GetFileUrlUseCase } from './application/use-cases/get-file-url.use-case';
import { ListFilesUseCase } from './application/use-cases/list-files.use-case';
import { StorageController } from './interfaces/http/storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [
    {
      provide: STORAGE_CONFIG,
      useFactory: () => StorageConfig.fromEnv(),
    },
    LocalStorageService,
    UploadThingStorageService,
    CloudinaryStorageService,
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
    StorageService,
    UploadFileUseCase,
    DeleteFileUseCase,
    GetFileUrlUseCase,
    ListFilesUseCase,
  ],
  exports: [
    STORAGE_SERVICE,
    STORAGE_CONFIG,
    StorageService,
    UploadFileUseCase,
    DeleteFileUseCase,
    GetFileUrlUseCase,
    ListFilesUseCase,
  ],
})
export class StorageModule {}
