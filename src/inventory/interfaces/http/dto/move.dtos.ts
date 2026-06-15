import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum MoveTypeDto {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  INTERNAL = 'INTERNAL',
}

export enum MoveStateDto {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export class CreateMoveDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({ description: 'ID de la variante del producto' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ enum: MoveTypeDto, description: 'Tipo de movimiento' })
  @IsEnum(MoveTypeDto)
  moveType!: MoveTypeDto;

  @ApiProperty({ description: 'Cantidad (como string para precisión decimal)' })
  @IsString()
  quantity!: string;

  @ApiProperty({ description: 'ID de la unidad de medida' })
  @IsString()
  unitOfMeasureId!: string;

  @ApiPropertyOptional({ description: 'ID de ubicación de origen' })
  @IsOptional()
  @IsString()
  fromLocationId?: string;

  @ApiPropertyOptional({ description: 'ID de ubicación de destino' })
  @IsOptional()
  @IsString()
  toLocationId?: string;

  @ApiPropertyOptional({ description: 'Referencia externa (PO, SO, etc.)' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Identificador externo (Odoo compatible)',
  })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({ description: 'Tabla de origen' })
  @IsOptional()
  @IsString()
  originTable?: string;

  @ApiPropertyOptional({ description: 'ID de origen' })
  @IsOptional()
  @IsString()
  originId?: string;
}

export class MoveResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;

  @ApiProperty({ type: 'string' })
  productId!: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  variantId!: string | null;

  @ApiProperty({
    enum: ['INBOUND', 'OUTBOUND', 'TRANSFER', 'ADJUSTMENT', 'INTERNAL'],
  })
  moveType!: string;

  @ApiProperty({ enum: ['DRAFT', 'CONFIRMED', 'DONE', 'CANCELLED'] })
  state!: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  fromLocationId!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  toLocationId!: string | null;

  @ApiProperty({ type: 'string' })
  quantity!: string;

  @ApiProperty({ type: 'string' })
  unitOfMeasureId!: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  reference!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  notes!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  externalId!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  originTable!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  originId!: string | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  confirmedAt!: Date | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  doneAt!: Date | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  cancelledAt!: Date | null;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  updatedAt!: Date | null;
}

export class MoveListResponseDto {
  @ApiProperty({ type: [MoveResponseDto] })
  data!: MoveResponseDto[];

  @ApiProperty({ type: 'number' })
  total!: number;

  @ApiProperty({ type: 'number' })
  page!: number;

  @ApiProperty({ type: 'number' })
  pageSize!: number;
}

export class ListMovesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    enum: ['INBOUND', 'OUTBOUND', 'TRANSFER', 'ADJUSTMENT', 'INTERNAL'],
  })
  @IsOptional()
  @IsString()
  moveType?: string;

  @ApiPropertyOptional({
    enum: ['DRAFT', 'CONFIRMED', 'DONE', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromLocationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toLocationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;
}

export class AdjustInventoryDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({ description: 'ID de la variante' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ description: 'ID de la ubicación' })
  @IsString()
  locationId!: string;

  @ApiProperty({ description: 'Cantidad final después del ajuste' })
  @IsString()
  quantity!: string;

  @ApiProperty({ description: 'ID de la unidad de medida' })
  @IsString()
  unitOfMeasureId!: string;

  @ApiProperty({ description: 'Razón del ajuste' })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}
