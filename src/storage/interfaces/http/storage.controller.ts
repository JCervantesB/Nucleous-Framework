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
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir archivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        bucket: { type: 'string', example: 'images' },
        filename: { type: 'string', example: 'photo.jpg' },
        contentType: { type: 'string', example: 'image/jpeg' },
      },
    },
  })
  @ApiResponse({ status: 201, type: UploadFileResponseDto })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
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
  @ApiOperation({ summary: 'Listar archivos (pendiente)' })
  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  async listFiles(@CurrentBusinessId() businessId: string) {
    return {
      message: 'List files endpoint - pendiente de implementar',
      businessId,
    };
  }

  @Get('files/:id/url')
  @ApiOperation({ summary: 'Obtener URL firmada de un archivo' })
  @ApiResponse({ status: 200, description: 'URL del archivo' })
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

  @Delete('files/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar archivo' })
  @ApiResponse({ status: 204, description: 'Archivo eliminado' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
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