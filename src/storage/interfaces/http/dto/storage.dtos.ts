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

  @ApiPropertyOptional({ description: 'Tiempo de expiración en segundos', default: 3600 })
  @IsOptional()
  expiresIn?: number;
}

export class StoredFileResponseDto {
  @ApiProperty({ example: 'abc123-def456' })
  key!: string;

  @ApiProperty({ example: 'images' })
  bucket!: string;

  @ApiProperty({ example: 'https://utfs.io/f/abc123' })
  url!: string;

  @ApiProperty({ example: false })
  isSigned!: boolean;

  @ApiProperty({ example: 1024 })
  size!: number;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 'photo.jpg' })
  originalName!: string;
}

export class UploadFileResponseDto {
  @ApiProperty({ type: StoredFileResponseDto })
  file!: StoredFileResponseDto;
}

export class DeleteFileResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
}

export class GetFileUrlResponseDto {
  @ApiProperty({ example: 'https://utfs.io/f/abc123?signature=xxx' })
  url!: string;
}