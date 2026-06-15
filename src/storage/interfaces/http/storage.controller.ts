import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UploadFileUseCase } from '../../application/use-cases/upload-file.use-case';
import { DeleteFileUseCase } from '../../application/use-cases/delete-file.use-case';
import { GetFileUrlUseCase } from '../../application/use-cases/get-file-url.use-case';
import { ListFilesUseCase } from '../../application/use-cases/list-files.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import {
  UploadFileDto,
  DeleteFileDto,
  GetFileUrlDto,
  UploadFileResponseDto,
  StoredFileResponseDto,
} from './dto/storage.dtos';

interface UploadedFileMulter {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@ApiTags('Storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly getFileUrlUseCase: GetFileUrlUseCase,
    private readonly listFilesUseCase: ListFilesUseCase,
  ) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Subir archivo',
    description: 'Sube un archivo al storage configurado (local, UploadThing o Cloudinary). El archivo se asocia al businessId del usuario. Se puede especificar el bucket (carpeta) destino. Soporta cualquier tipo de archivo hasta el límite configurado.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo a subir (multipart/form-data). El archivo va en el campo "file".',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Archivo binario a subir' },
        bucket: { type: 'string', example: 'images', description: 'Bucket o carpeta destino' },
        filename: { type: 'string', example: 'photo.jpg', description: 'Nombre alternativo para el archivo (opcional)' },
        contentType: { type: 'string', example: 'image/jpeg', description: 'Tipo MIME del archivo (opcional, se infiere del archivo)' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente. Retorna la URL pública, clave única y metadatos del archivo.',
    type: () => UploadFileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o faltante.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentBusinessId() businessId: string,
    @UploadedFile() file: UploadedFileMulter,
    @Body() dto: UploadFileDto,
  ) {
    const result = await this.uploadFileUseCase.execute({
      businessId,
      bucket: dto.bucket,
      buffer: file.buffer,
      filename: dto.filename ?? file.originalname,
      contentType: dto.contentType ?? file.mimetype,
    });

    if (!result.success || !result.file) {
      throw new Error(result.error ?? 'Error uploading file');
    }

    const storedFile = result.file;
    return {
      file: {
        key: storedFile.key,
        bucket: storedFile.bucket,
        url: storedFile.url.url,
        isSigned: storedFile.url.isSigned,
        size: storedFile.metadata.size,
        mimeType: storedFile.metadata.mimeType,
        originalName: storedFile.metadata.originalName,
      } as StoredFileResponseDto,
    };
  }

  @Get('files')
  @ApiOperation({
    summary: 'Listar archivos',
    description: 'Retorna una lista de archivos almacenados. Opcionalmente filtra por bucket o prefijo de ruta. Útil para dashboards de archivos, galerías de imágenes, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos obtenidos exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async listFiles(
    @CurrentBusinessId() businessId: string,
    @Query('bucket') bucket?: string,
    @Query('prefix') prefix?: string,
  ) {
    const result = await this.listFilesUseCase.execute({
      bucket,
      prefix,
    });

    if (!result.success) {
      throw new Error(result.error ?? 'Error listing files');
    }

    return {
      data: result.files?.map(file => ({
        key: file.key,
        bucket: file.bucket,
        url: file.url.url,
        isSigned: file.url.isSigned,
        size: file.metadata.size,
        mimeType: file.metadata.mimeType,
        originalName: file.metadata.originalName,
        uploadedAt: file.metadata.uploadedAt,
      })) ?? [],
    };
  }

  @Get('files/url')
  @ApiOperation({
    summary: 'Obtener URL firmada de un archivo',
    description: 'Genera una URL firmada (con token de autenticación) para acceder a un archivo privado. El parámetro expiresIn define segundos de validez (por defecto 3600). Solo funciona para archivos en storage que soporte URLs firmadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'URL firmada generada exitosamente. Válida por el tiempo especificado en expiresIn.',
  })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async getFileUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() dto: GetFileUrlDto,
  ) {
    const result = await this.getFileUrlUseCase.execute({
      key: dto.key,
      bucket: dto.bucket,
      options: dto.expiresIn ? { expiresIn: dto.expiresIn } : undefined,
    });

    if (!result.success) {
      throw new Error(result.error ?? 'Error getting file URL');
    }

    return { url: result.url };
  }

  @Delete('files')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar archivo',
    description: 'Elimina un archivo del storage. Se identifica por bucket y key (ruta/nombre del archivo). Esta acción es irreversible.',
  })
  @ApiResponse({ status: 204, description: 'Archivo eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado en el storage.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeleteFileDto,
  ) {
    const result = await this.deleteFileUseCase.execute({
      key: dto.key,
      bucket: dto.bucket,
    });

    if (!result.success) {
      throw new Error(result.error ?? 'Error deleting file');
    }
  }
}