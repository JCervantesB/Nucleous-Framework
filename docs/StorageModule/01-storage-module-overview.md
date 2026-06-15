# Storage Module - Visión General

## Descripción

El **StorageModule** es un módulo transversal opcional de Nucleous Framework que proporciona capacidades de almacenamiento de archivos a través de múltiples proveedores (Local, UploadThing, Cloudinary).

## Características

- **Multi-proveedor**: Soporta Local, UploadThing y Cloudinary
- **Fachada unificada**: `StorageService` selecciona el proveedor en tiempo de ejecución
- **Value Objects**: Tipado fuerte con `StoredFile`, `StorageBucket`, `StoragePath`
- **Use Cases**: `UploadFileUseCase`, `DeleteFileUseCase`, `GetFileUrlUseCase`
- **URLs firmadas**: Soporte para URLs temporales con expiración
- **Verificación de existencia**: Verifica si un archivo existe en el storage

## Arquitectura

```
src/storage/
├── domain/                              # Lógica pura
│   └── value-objects/
│       ├── stored-file.vo.ts            # Archivo almacenado
│       ├── storage-bucket.vo.ts         # Bucket/contenedor
│       └── storage-path.vo.ts           # Ruta de archivo
│
├── application/                         # Servicios y casos de uso
│   ├── storage.tokens.ts               # Símbolos DI
│   ├── storage.types.ts                # Tipos compartidos
│   ├── storage.service.ts              # Fachada principal
│   └── use-cases/
│       ├── upload-file.use-case.ts
│       ├── delete-file.use-case.ts
│       └── get-file-url.use-case.ts
│
├── infrastructure/                      # Implementaciones
│   ├── config/storage.config.ts        # Configuración de proveedores
│   └── providers/
│       ├── local-storage.service.ts    # Almacenamiento local
│       ├── uploadthing-storage.service.ts  # UploadThing SDK
│       └── cloudinary-storage.service.ts  # Cloudinary SDK
│
└── storage.module.ts                   # Definición del módulo
```

## Habilitación

### 1. Agregar STORAGE a VALID_MODULES

```typescript
// apps/api-default/module-validator.ts

export const VALID_MODULES = [
  'AI',
  'EMAIL',
  'STORAGE',  // ← Agregar STORAGE
] as const;

export type ValidModuleName = (typeof VALID_MODULES)[number];
```

### 2. Importar condicionalmente en AppModule

```typescript
// apps/api-default/app.module.ts

import { Module, type Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { AiModule } from '../../src/ai/ai.module';
import { EmailModule } from '../../src/email/email.module';
import { StorageModule } from '../../src/storage/storage.module';  // ← Importar
import { validateEnabledModules, getEnabledModules } from './module-validator';

validateEnabledModules();
const enabledModules = getEnabledModules();

const imports: Type<any>[] = [
  DatabaseModule,
  AuthModule,
  CoreModule,
];

if (enabledModules.includes('AI')) {
  imports.push(AiModule);
}

if (enabledModules.includes('EMAIL')) {
  imports.push(EmailModule);
}

if (enabledModules.includes('STORAGE')) {  // ← Condicional
  imports.push(StorageModule);
}

@Module({ imports })
export class AppModule {}
```

### 3. Configurar variables de entorno

Ver sección de Variables de Entorno abajo.

## Variables de Entorno

### Configuración General

```env
# Habilitar módulo
ENABLED_MODULES=AI,EMAIL,STORAGE

# Proveedor: local | uploadthing | cloudinary
STORAGE_PROVIDER=uploadthing
```

### UploadThing

```env
STORAGE_PROVIDER=uploadthing
UPLOADTHING_APP_ID=tu_app_id
UPLOADTHING_TOKEN=tu_token_jwt
# También acepta UPLOADTHING_SECRET como alternativa
```

### Cloudinary

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Local

```env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./uploads
LOCAL_STORAGE_BASE_URL=http://localhost:3000/uploads
```

## Proveedores Compatibles

| Proveedor | Configuración | Notas |
|-----------|---------------|-------|
| **Local** | `LOCAL_STORAGE_PATH`, `LOCAL_STORAGE_BASE_URL` | Desarrollo, archivos estáticos |
| **UploadThing** | `UPLOADTHING_APP_ID`, `UPLOADTHING_TOKEN` | Production, CDN incluido |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Transformaciones de imagen |

## Buckets Conocidos

El módulo define buckets predefinidos para organización:

```typescript
import { StorageBucket, WellKnownBucket } from './storage';

StorageBucket.DOCUMENTS  // 'documents'
StorageBucket.IMAGES      // 'images'
StorageBucket.AVATARS     // 'avatars'
StorageBucket.ATTACHMENTS // 'attachments'
StorageBucket.TEMP        // 'temp'
```

## Uso Básico

```typescript
import { UploadFileUseCase, WellKnownBucket } from './storage';

@Injectable()
class ProductImageService {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  async uploadProductImage(productId: string, file: Buffer, mimeType: string) {
    const result = await this.uploadFileUseCase.execute({
      businessId: 'uuid-del-negocio',
      bucket: WellKnownBucket.IMAGES,
      buffer: file,
      filename: `${productId}-hero.jpg`,
      contentType: mimeType,
    });

    if (!result.success) {
      throw new Error(`Error subiendo imagen: ${result.error}`);
    }

    return result.file.url;
  }
}
```

## Flujo de una Upload

```
UploadFileUseCase
    │
     └──► StorageService.upload()
               │
               ├──► LocalStorageService.upload()
               │         │
               │         └──► fs.writeFile()
               │
               ├──► UploadThingStorageService.upload()
               │         │
               │         └──► UTApi.uploadFiles()
               │
               └──► CloudinaryStorageService.upload()
                         │
                         └──► cloudinary.uploader.upload()
```

## Integración con Módulos de Negocio

Los módulos de negocio deben usar `StorageService` o los Use Cases, **nunca llamar directo a un provider específico**.

```typescript
// ✅ CORRECTO - Usa la fachada
import { StorageService, WellKnownBucket } from './storage';

@Injectable()
class ProductService {
  constructor(private readonly storageService: StorageService) {}

  async uploadImage(productId: string, buffer: Buffer) {
    const result = await this.storageService.upload({
      businessId: this.businessId,
      bucket: WellKnownBucket.IMAGES,
      buffer,
      filename: `${productId}.jpg`,
      contentType: 'image/jpeg',
    });

    return result.file.url;
  }
}

// ❌ INCORRECTO - Acoplamiento directo a provider
// No hacer esto nunca:
import { UploadThingStorageService } from './storage/infrastructure/providers/uploadthing-storage.service';
```