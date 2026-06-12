# Storage Module - Uso

## Subida de Archivos

### Uso Básico con Use Case

```typescript
import { UploadFileUseCase, WellKnownBucket } from './storage';
import { Readable } from 'stream';

@Injectable()
class DocumentService {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  async uploadContract(contractId: string, fileBuffer: Buffer) {
    const result = await this.uploadFileUseCase.execute({
      businessId: 'uuid-del-negocio',
      bucket: WellKnownBucket.DOCUMENTS,
      buffer: fileBuffer,
      filename: `contract-${contractId}.pdf`,
      contentType: 'application/pdf',
    });

    if (!result.success) {
      throw new Error(`Error subiendo contrato: ${result.error}`);
    }

    return {
      key: result.file.key,
      url: result.file.url,
      size: result.file.metadata.size,
    };
  }
}
```

### Desde un Stream (Upload de Multer)

```typescript
import { UploadFileUseCase, WellKnownBucket } from './storage';

@Injectable()
class AvatarService {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const result = await this.uploadFileUseCase.execute({
      businessId: 'uuid-del-negocio',
      bucket: WellKnownBucket.AVATARS,
      buffer: file.buffer,
      filename: `avatar-${userId}.${file.mimetype.split('/')[1]}`,
      contentType: file.mimetype,
    });

    return result.file;
  }
}
```

### Uso Directo con StorageService

```typescript
import { StorageService, WellKnownBucket } from './storage';

@Injectable()
class ImageGalleryService {
  constructor(private readonly storageService: StorageService) {}

  async uploadGalleryImage(galleryId: string, files: Express.Multer.File[]) {
    const uploadedFiles = [];

    for (const file of files) {
      const result = await this.storageService.upload({
        businessId: this.businessId,
        bucket: WellKnownBucket.IMAGES,
        buffer: file.buffer,
        filename: file.originalname,
        contentType: file.mimetype,
      });

      if (result.success) {
        uploadedFiles.push({
          key: result.file.key,
          url: result.file.url,
          metadata: result.file.metadata,
        });
      }
    }

    return uploadedFiles;
  }
}
```

## Eliminación de Archivos

### Uso Básico con Use Case

```typescript
import { DeleteFileUseCase } from './storage';

@Injectable()
class ProductService {
  constructor(private readonly deleteFileUseCase: DeleteFileUseCase) {}

  async deleteProductImage(productId: string, imageKey: string) {
    const result = await this.deleteFileUseCase.execute({
      businessId: 'uuid-del-negocio',
      bucket: WellKnownBucket.IMAGES,
      key: imageKey,
    });

    if (!result.success) {
      console.error(`Error eliminando imagen: ${result.error}`);
    }

    return result.success;
  }
}
```

### Eliminación con StorageService

```typescript
import { StorageService } from './storage';

@Injectable()
class CleanupService {
  constructor(private readonly storageService: StorageService) {}

  async cleanupTempFiles(keys: string[]) {
    const results = [];

    for (const key of keys) {
      const result = await this.storageService.delete({
        businessId: this.businessId,
        bucket: WellKnownBucket.TEMP,
        key,
      });
      results.push({ key, success: result.success });
    }

    return results;
  }
}
```

## Obtención de URLs

### URL Pública (por defecto)

```typescript
import { GetFileUrlUseCase } from './storage';

@Injectable()
class DocumentShareService {
  constructor(private readonly getFileUrlUseCase: GetFileUrlUseCase) {}

  async getDocumentUrl(documentKey: string) {
    const result = await this.getFileUrlUseCase.execute({
      businessId: 'uuid-del-negocio',
      bucket: WellKnownBucket.DOCUMENTS,
      key: documentKey,
    });

    if (!result.success) {
      throw new Error(`Error obteniendo URL: ${result.error}`);
    }

    return result.url;
  }
}
```

### URL Firmada (con expiración)

```typescript
import { GetFileUrlUseCase } from './storage';

@Injectable()
class SecureDownloadService {
  constructor(private readonly getFileUrlUseCase: GetFileUrlUseCase) {}

  async generateSecureUrl(fileKey: string, expiresIn: number = 3600) {
    const result = await this.getFileUrlUseCase.execute({
      businessId: 'uuid-del-negocio',
      bucket: WellKnownBucket.DOCUMENTS,
      key: fileKey,
      expiresIn, // Segundos hasta expiración (por defecto 3600)
    });

    return result.url; // URL temporal firmada
  }
}
```

### Verificar Existencia

```typescript
import { StorageService } from './storage';

@Injectable()
class CacheService {
  constructor(private readonly storageService: StorageService) {}

  async fileExists(key: string): Promise<boolean> {
    return this.storageService.exists({
      businessId: this.businessId,
      bucket: WellKnownBucket.IMAGES,
      key,
    });
  }
}
```

## Buckets Personalizados

### Crear un Bucket

```typescript
import { StorageBucket } from './storage';

// En domain/value-objects/storage-bucket.vo.ts
export const WellKnownBucket = {
  DOCUMENTS: 'documents',
  IMAGES: 'images',
  AVATARS: 'avatars',
  ATTACHMENTS: 'attachments',
  TEMP: 'temp',
  // Agregar buckets personalizados según necesidad
  PRODUCTS: 'products',
  INVOICES: 'invoices',
} as const;
```

### Uso de Buckets

```typescript
import { StorageBucket, WellKnownBucket } from './storage';

// Usar bucket predefinido
const bucket = WellKnownBucket.DOCUMENTS;

// Crear bucket custom
const customBucket = StorageBucket.create('reports');

// Validar bucket
if (bucket.equals(WellKnownBucket.IMAGES)) {
  // Es una imagen
}
```

## Value Objects

### StoredFile

```typescript
import { StoredFile, WellKnownBucket } from './storage';

const storedFile = StoredFile.create({
  bucket: WellKnownBucket.IMAGES,
  key: 'abc123-def456',
  metadata: {
    size: 1024,
    mimeType: 'image/jpeg',
    originalName: 'photo.jpg',
    uploadedAt: new Date(),
  },
  url: {
    url: 'https://utfs.io/f/abc123',
    isSigned: false,
  },
});

// Acceder propiedades
console.log(storedFile.bucket.value);  // 'images'
console.log(storedFile.key);            // 'abc123-def456'
console.log(storedFile.metadata.size);  // 1024
console.log(storedFile.url.value);      // 'https://utfs.io/f/abc123'
```

### StoragePath

```typescript
import { StoragePath } from './storage';

const path = StoragePath.create('products/2024/06', 'image.jpg');

console.log(path.bucket);      // 'products/2024/06'
console.log(path.filename);    // 'image.jpg'
console.log(path.fullPath);    // 'products/2024/06/image.jpg'
console.log(path.extension);   // 'jpg'
```

## Ejemplo: Servicio de Productos con Imágenes

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { UploadFileUseCase, DeleteFileUseCase, GetFileUrlUseCase, WellKnownBucket } from './storage';

@Injectable()
export class ProductImageService {
  private readonly logger = new Logger(ProductImageService.name);

  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly getFileUrlUseCase: GetFileUrlUseCase,
  ) {}

  async uploadProductImage(productId: string, file: Express.Multer.File) {
    const result = await this.uploadFileUseCase.execute({
      businessId: this.businessId,
      bucket: WellKnownBucket.IMAGES,
      buffer: file.buffer,
      filename: `product-${productId}-${Date.now()}.${file.mimetype.split('/')[1]}`,
      contentType: file.mimetype,
    });

    if (!result.success) {
      this.logger.error(`Error subiendo imagen del producto ${productId}: ${result.error}`);
      throw new Error('Error subiendo imagen');
    }

    return {
      key: result.file.key,
      url: result.file.url,
      metadata: result.file.metadata,
    };
  }

  async deleteProductImage(productId: string, imageKey: string) {
    const result = await this.deleteFileUseCase.execute({
      businessId: this.businessId,
      bucket: WellKnownBucket.IMAGES,
      key: imageKey,
    });

    if (!result.success) {
      this.logger.warn(`No se pudo eliminar imagen ${imageKey} del producto ${productId}`);
    }

    return result.success;
  }

  async getImageUrl(imageKey: string): Promise<string> {
    const result = await this.getFileUrlUseCase.execute({
      businessId: this.businessId,
      bucket: WellKnownBucket.IMAGES,
      key: imageKey,
    });

    if (!result.success) {
      throw new Error('Imagen no encontrada');
    }

    return result.url;
  }

  async replaceProductImage(productId: string, oldImageKey: string, newFile: Express.Multer.File) {
    // 1. Subir nueva imagen
    const uploaded = await this.uploadProductImage(productId, newFile);

    // 2. Eliminar imagen anterior (si existe)
    if (oldImageKey) {
      await this.deleteProductImage(productId, oldImageKey);
    }

    return uploaded;
  }
}
```

## Ejemplo: Upload Masivo

```typescript
import { Injectable } from '@nestjs/common';
import { StorageService, WellKnownBucket } from './storage';

@Injectable()
export class BulkUploadService {
  constructor(private readonly storageService: StorageService) {}

  async uploadBatch(files: Express.Multer.File[], businessId: string) {
    const results = await Promise.allSettled(
      files.map((file) =>
        this.storageService.upload({
          businessId,
          bucket: WellKnownBucket.ATTACHMENTS,
          buffer: file.buffer,
          filename: file.originalname,
          contentType: file.mimetype,
        }),
      ),
    );

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful.push({
          filename: files[index].originalname,
          file: result.value.file,
        });
      } else {
        failed.push({
          filename: files[index].originalname,
          error: result.status === 'rejected' ? result.reason : result.value?.error,
        });
      }
    });

    return { successful, failed };
  }
}
```

## Respuestas de los Use Cases

### UploadFileOutput

```typescript
interface UploadFileOutput {
  success: boolean;
  file?: StoredFile;
  error?: string;
}
```

### DeleteFileOutput

```typescript
interface DeleteFileOutput {
  success: boolean;
  error?: string;
}
```

### GetFileUrlOutput

```typescript
interface GetFileUrlOutput {
  success: boolean;
  url?: string;
  error?: string;
}
```