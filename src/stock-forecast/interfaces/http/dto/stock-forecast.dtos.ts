import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForecastQueryDto {
  @ApiPropertyOptional({ description: 'ID de ubicación' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Días hacia adelante para predicción', default: 30 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(365)
  daysAhead?: number = 30;

  @ApiPropertyOptional({ description: 'Método de forecast', enum: ['AUTO', 'MATH', 'AI'], default: 'AUTO' })
  @IsOptional()
  @IsString()
  method?: 'AUTO' | 'MATH' | 'AI' = 'AUTO';
}

export class StockAlertQueryDto {
  @ApiPropertyOptional({ description: 'Días hasta alerta', default: 7 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(90)
  threshold?: number = 7;

  @ApiPropertyOptional({ description: 'ID de ubicación' })
  @IsOptional()
  @IsString()
  locationId?: string;
}

export class DailyPredictionDto {
  @ApiProperty({ description: 'Fecha ISO YYYY-MM-DD' })
  date: string;

  @ApiProperty({ description: 'Cantidad predicha' })
  predictedQuantity: string;

  @ApiProperty({ description: 'Límite inferior' })
  lowerBound: string;

  @ApiProperty({ description: 'Límite superior' })
  upperBound: string;
}

export class ForecastResponseDto {
  @ApiProperty({ description: 'ID del producto' })
  productId: string;

  @ApiProperty({ description: 'ID de ubicación', nullable: true })
  locationId: string | null;

  @ApiProperty({ description: 'Stock actual' })
  currentStock: string;

  @ApiProperty({ description: 'Stock predicho' })
  predictedStock: string;

  @ApiProperty({ description: 'Tasa de consumo diaria' })
  consumptionRate: string;

  @ApiProperty({ description: 'Días hasta agotarse', nullable: true })
  daysUntilStockout: number | null;

  @ApiProperty({ description: 'Nivel de confianza (0-1)' })
  confidence: number;

  @ApiProperty({ description: 'Método utilizado', enum: ['MOVING_AVERAGE', 'EXPONENTIAL_SMOOTHING', 'AI'] })
  method: 'MOVING_AVERAGE' | 'EXPONENTIAL_SMOOTHING' | 'AI';

  @ApiProperty({ description: 'Predicciones diarias', type: [DailyPredictionDto] })
  predictions: DailyPredictionDto[];
}

export class StockAlertResponseDto {
  @ApiProperty({ description: 'ID del producto' })
  productId: string;

  @ApiProperty({ description: 'ID de ubicación', nullable: true })
  locationId: string | null;

  @ApiProperty({ description: 'Stock actual' })
  currentStock: string;

  @ApiProperty({ description: 'Días hasta agotarse' })
  daysUntilStockout: number;

  @ApiProperty({ description: 'Nivel de confianza (0-1)' })
  confidence: number;

  @ApiProperty({ description: 'Método utilizado' })
  method: string;
}
