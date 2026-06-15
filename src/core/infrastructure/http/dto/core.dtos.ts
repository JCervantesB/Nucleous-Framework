import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Nombre legal',
    example: 'Mi Empresa S.A.S',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({
    description: 'Código de país (ISO 3166-1 alpha-2)',
    example: 'CO',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Zona horaria',
    example: 'America/Bogota',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Código de moneda (ISO 4217)',
    example: 'COP',
  })
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
  @ApiProperty({ type: 'string', description: 'ID del negocio' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'Nombre del negocio' })
  name!: string;

  @ApiProperty({ type: 'string', description: 'Slug del negocio' })
  slug!: string;

  @ApiPropertyOptional({ type: 'string', description: 'Nombre legal' })
  legalName?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Código de país' })
  countryCode?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Zona horaria' })
  timezone?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Código de moneda' })
  currencyCode?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Nombre público' })
  publicName?: string;

  @ApiProperty({ type: 'boolean', description: 'Si está activo' })
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

  @ApiPropertyOptional({ description: '¿Es cliente?', example: false })
  @IsOptional()
  @IsBoolean()
  isCustomer?: boolean;

  @ApiPropertyOptional({ description: '¿Es proveedor?', example: false })
  @IsOptional()
  @IsBoolean()
  isSupplier?: boolean;

  @ApiPropertyOptional({ description: '¿Es empleado?', example: false })
  @IsOptional()
  @IsBoolean()
  isEmployee?: boolean;
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

  @ApiPropertyOptional({ description: '¿Es cliente?', example: false })
  @IsOptional()
  @IsBoolean()
  isCustomer?: boolean;

  @ApiPropertyOptional({ description: '¿Es proveedor?', example: false })
  @IsOptional()
  @IsBoolean()
  isSupplier?: boolean;

  @ApiPropertyOptional({ description: '¿Es empleado?', example: false })
  @IsOptional()
  @IsBoolean()
  isEmployee?: boolean;
}

export class ContactResponseDto {
  @ApiProperty({ type: 'string', description: 'ID del contacto' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'Nombre' })
  firstName!: string;

  @ApiProperty({ type: 'string', description: 'Apellido' })
  lastName!: string;

  @ApiProperty({ type: 'string', description: 'Email' })
  email!: string;

  @ApiPropertyOptional({ type: 'string', description: 'Teléfono' })
  phone?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Notas' })
  notes?: string;

  @ApiProperty({ type: 'boolean', description: '¿Es cliente?' })
  isCustomer!: boolean;

  @ApiProperty({ type: 'boolean', description: '¿Es proveedor?' })
  isSupplier!: boolean;

  @ApiProperty({ type: 'boolean', description: '¿Es empleado?' })
  isEmployee!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Fecha de creación',
  })
  createdAt!: Date;
}

export class CreateActivityDto {
  @ApiProperty({
    description: 'Título de la actividad',
    example: 'Llamar al cliente',
  })
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

  @ApiPropertyOptional({
    description: 'Tabla relacionada',
    example: 'contacts',
  })
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
  @ApiProperty({ type: 'string', description: 'ID de la actividad' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'Título' })
  title!: string;

  @ApiPropertyOptional({ type: 'string', description: 'Descripción' })
  description?: string;

  @ApiProperty({ type: 'string', description: 'Tipo de actividad' })
  activityType!: string;

  @ApiPropertyOptional({ type: 'string', description: 'ID del registro' })
  recordId?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'ID del usuario asignado',
  })
  assignedToId?: string;

  @ApiProperty({ type: 'boolean', description: 'Si está completada' })
  completed!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Fecha de creación',
  })
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

  @ApiProperty({ description: 'ID de la entidad', type: 'string' })
  @IsString()
  entityId!: string;

  @ApiPropertyOptional({ description: 'Datos del evento (JSON)' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class RecordEventResponseDto {
  @ApiProperty({ type: 'string', description: 'ID del evento' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'Tipo de evento' })
  eventType!: string;

  @ApiProperty({ type: 'string', description: 'Entidad' })
  entity!: string;

  @ApiProperty({ type: 'string', description: 'ID de la entidad' })
  entityId!: string;

  @ApiPropertyOptional({ type: Object, description: 'Metadatos' })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Fecha de creación',
  })
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
  @ApiProperty({ type: 'string', description: 'Clave' })
  key!: string;

  @ApiProperty({ type: 'string', description: 'Valor' })
  value!: string;

  @ApiPropertyOptional({ type: 'string', description: 'Descripción' })
  description?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Fecha de actualización',
  })
  updatedAt!: Date;
}
