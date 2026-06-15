import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GetStockQueryDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({ description: 'ID de la variante del producto' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    description:
      'ID de la ubicación (opcional, si no se especifica retorna todas)',
  })
  @IsOptional()
  @IsString()
  locationId?: string;
}

export class StockInfoDto {
  @ApiProperty()
  productId!: string;

  @ApiPropertyOptional()
  variantId!: string | null;

  @ApiPropertyOptional()
  locationId!: string | null;

  @ApiPropertyOptional()
  locationName!: string | null;

  @ApiProperty()
  quantity!: string;
}

export class StockResponseDto {
  @ApiProperty({ type: [StockInfoDto] })
  stocks!: StockInfoDto[];

  @ApiProperty()
  total!: string;
}
