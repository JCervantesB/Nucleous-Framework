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
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiPropertyOptional()
  variantId!: string | null;

  @ApiProperty({ enum: MoveTypeDto })
  moveType!: string;

  @ApiProperty({ enum: MoveStateDto })
  state!: string;

  @ApiPropertyOptional()
  fromLocationId!: string | null;

  @ApiPropertyOptional()
  toLocationId!: string | null;

  @ApiProperty()
  quantity!: string;

  @ApiProperty()
  unitOfMeasureId!: string;

  @ApiPropertyOptional()
  reference!: string | null;

  @ApiPropertyOptional()
  notes!: string | null;

  @ApiPropertyOptional()
  externalId!: string | null;

  @ApiPropertyOptional()
  originTable!: string | null;

  @ApiPropertyOptional()
  originId!: string | null;

  @ApiPropertyOptional()
  confirmedAt!: Date | null;

  @ApiPropertyOptional()
  doneAt!: Date | null;

  @ApiPropertyOptional()
  cancelledAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  updatedAt!: Date | null;
}

export class MoveListResponseDto {
  @ApiProperty({ type: [MoveResponseDto] })
  data!: MoveResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
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

  @ApiPropertyOptional({ enum: MoveTypeDto })
  @IsOptional()
  @IsEnum(MoveTypeDto)
  moveType?: MoveTypeDto;

  @ApiPropertyOptional({ enum: MoveStateDto })
  @IsOptional()
  @IsEnum(MoveStateDto)
  state?: MoveStateDto;

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
