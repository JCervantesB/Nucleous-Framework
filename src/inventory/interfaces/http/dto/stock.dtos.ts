import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GetStockQueryDto {
  @ApiProperty({ type: 'string', description: 'ID del producto' })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'ID de la variante del producto',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    type: 'string',
    description:
      'ID de la ubicación (opcional, si no se especifica retorna todas)',
  })
  @IsOptional()
  @IsString()
  locationId?: string;
}

export class StockInfoDto {
  @ApiProperty({ type: 'string' })
  productId!: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  variantId!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  locationId!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  locationName!: string | null;

  @ApiProperty({ type: 'string' })
  quantity!: string;
}

export class StockResponseDto {
  @ApiProperty({ type: [StockInfoDto] })
  stocks!: StockInfoDto[];

  @ApiProperty({ type: 'string' })
  total!: string;
}
