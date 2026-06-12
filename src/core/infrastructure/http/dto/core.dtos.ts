import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsUUID, MinLength, MaxLength, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusinessDto {
  @ApiProperty({ description: 'Nombre del negocio', example: 'Mi Empresa' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Slug único del negocio', example: 'mi-empresa' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  slug!: string;

  @ApiPropertyOptional({ description: 'Nombre legal', example: 'Mi Empresa S.A.S' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ description: 'Código de país (ISO 3166-1 alpha-2)', example: 'CO' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  countryCode?: string;

  @ApiPropertyOptional({ description: 'Zona horaria', example: 'America/Bogota' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ description: 'Código de moneda (ISO 4217)', example: 'COP' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string;

  @ApiPropertyOptional({ description: 'Nombre público', example: 'Mi Empresa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  publicName?: string;
}

export class UpdateBusinessDto {
  @ApiPropertyOptional({ description: 'Nombre del negocio' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Nombre legal' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ description: 'Nombre público' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  publicName?: string;

  @ApiPropertyOptional({ description: 'Código de país' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  countryCode?: string;

  @ApiPropertyOptional({ description: 'Zona horaria' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ description: 'Código de moneda' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string;
}

export class BusinessResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Mi Empresa' })
  name!: string;

  @ApiProperty({ example: 'mi-empresa' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Mi Empresa S.A.S' })
  legalName?: string;

  @ApiPropertyOptional({ example: 'CO' })
  countryCode?: string;

  @ApiPropertyOptional({ example: 'America/Bogota' })
  timezone?: string;

  @ApiPropertyOptional({ example: 'COP' })
  currencyCode?: string;

  @ApiPropertyOptional({ example: 'Mi Empresa' })
  publicName?: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class CreateContactDto {
  @ApiProperty({ description: 'Nombre', example: 'Juan' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ description: 'Apellido', example: 'Pérez' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ description: 'Email', example: 'juan@example.com' })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '+5712345678900' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Notas' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional({ description: 'Nombre' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellido' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Notas' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ContactResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Juan' })
  firstName!: string;

  @ApiProperty({ example: 'Pérez' })
  lastName!: string;

  @ApiProperty({ example: 'juan@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: '+5712345678900' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Notas del contacto' })
  notes?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date;
}

export class CreateActivityDto {
  @ApiProperty({ description: 'Título de la actividad', example: 'Llamar al cliente' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Tipo de actividad', example: 'call' })
  @IsString()
  activityType!: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'ID del usuario asignado' })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiPropertyOptional({ description: 'Tabla relacionada', example: 'contacts' })
  @IsOptional()
  @IsString()
  relatedTable?: string;

  @ApiPropertyOptional({ description: 'ID del registro relacionado' })
  @IsOptional()
  @IsUUID()
  relatedId?: string;
}

export class UpdateActivityDto {
  @ApiPropertyOptional({ description: 'Título' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Completada' })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class ActivityResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Llamar al cliente' })
  title!: string;

  @ApiPropertyOptional({ example: 'Descripción de la actividad' })
  description?: string;

  @ApiProperty({ example: 'call' })
  activityType!: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  recordId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  assignedToId?: string;

  @ApiProperty({ example: false })
  completed!: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date;
}

export class RecordEventDto {
  @ApiProperty({ description: 'Tipo de evento', example: 'created' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  eventType!: string;

  @ApiProperty({ description: 'Entidad', example: 'Contact' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  entity!: string;

  @ApiProperty({ description: 'ID de la entidad', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  entityId!: string;

  @ApiPropertyOptional({ description: 'Datos del evento (JSON)' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class RecordEventResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'created' })
  eventType!: string;

  @ApiProperty({ example: 'Contact' })
  entity!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  entityId!: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date;
}

export class ConfigParameterDto {
  @ApiProperty({ description: 'Clave del parámetro', example: 'app.name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key!: string;

  @ApiProperty({ description: 'Valor del parámetro', example: 'Mi Aplicación' })
  @IsString()
  @MaxLength(500)
  value!: string;
}

export class ConfigParameterResponseDto {
  @ApiProperty({ example: 'app.name' })
  key!: string;

  @ApiProperty({ example: 'Mi Aplicación' })
  value!: string;

  @ApiPropertyOptional({ example: 'Nombre de la aplicación' })
  description?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt!: Date;
}