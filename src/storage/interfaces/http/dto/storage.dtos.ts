import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ description: 'Bucket donde se almacenará el archivo' })
  @IsString()
  bucket!: string;

  @ApiPropertyOptional({ description: 'Nombre original del archivo' })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ description: 'Tipo MIME del archivo' })
  @IsOptional()
  @IsString()
  contentType?: string;
}

export class DeleteFileDto {
  @ApiProperty({ description: 'Bucket del archivo' })
  @IsString()
  bucket!: string;

  @ApiProperty({ description: 'Key del archivo a eliminar' })
  @IsString()
  key!: string;
}

export class GetFileUrlDto {
  @ApiProperty({ description: 'Bucket del archivo' })
  @IsString()
  bucket!: string;

  @ApiProperty({ description: 'Key del archivo' })
  @IsString()
  key!: string;

  @ApiPropertyOptional({
    description: 'Tiempo de expiración en segundos',
    default: 3600,
  })
  @IsOptional()
  expiresIn?: number;
}

export class StoredFileResponseDto {
  @ApiProperty({ type: 'string', description: 'Clave única del archivo' })
  key!: string;

  @ApiProperty({ type: 'string', description: 'Bucket o carpeta' })
  bucket!: string;

  @ApiProperty({ type: 'string', description: 'URL del archivo' })
  url!: string;

  @ApiProperty({ type: 'boolean', description: 'Si es una URL firmada' })
  isSigned!: boolean;

  @ApiProperty({ type: 'number', description: 'Tamaño en bytes' })
  size!: number;

  @ApiProperty({ type: 'string', description: 'Tipo MIME' })
  mimeType!: string;

  @ApiProperty({ type: 'string', description: 'Nombre original' })
  originalName!: string;
}

export class UploadFileResponseDto {
  @ApiProperty({
    type: () => StoredFileResponseDto,
    description: 'Datos del archivo subido',
  })
  file!: StoredFileResponseDto;
}

export class DeleteFileResponseDto {
  @ApiProperty({
    type: 'boolean',
    description: 'Si la eliminación fue exitosa',
  })
  success!: boolean;
}

export class GetFileUrlResponseDto {
  @ApiProperty({ type: 'string', description: 'URL firmada del archivo' })
  url!: string;
}
