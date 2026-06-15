import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateTextDto {
  @ApiProperty({ description: 'Prompt para generar texto', example: 'Explica qué es NestJS en 2 oraciones' })
  @IsString()
  prompt!: string;

  @ApiPropertyOptional({ description: 'Provider de IA', example: 'openai' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Modelo específico', example: 'gpt-4o-mini' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Alias del modelo (reasoning, fast)', example: 'fast' })
  @IsOptional()
  @IsString()
  modelAlias?: string;

  @ApiPropertyOptional({ description: 'Temperatura (0-1)', example: 0.7, minimum: 0, maximum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @ApiPropertyOptional({ description: 'Máximo de tokens', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTokens?: number;

  @ApiPropertyOptional({ description: 'Prompt del sistema', example: 'Eres un asistente útil' })
  @IsOptional()
  @IsString()
  systemPrompt?: string;
}

export class ChatMessageDto {
  @ApiProperty({ description: 'Rol del mensaje', example: 'user', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role!: 'user' | 'assistant' | 'system';

  @ApiProperty({ description: 'Contenido del mensaje', example: '¿Qué es TypeScript?' })
  @IsString()
  content!: string;
}

export class ChatDto {
  @ApiProperty({ description: 'Mensajes del chat', type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  @ApiPropertyOptional({ description: 'Provider de IA', example: 'openai' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Modelo específico', example: 'gpt-4o-mini' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Alias del modelo', example: 'fast' })
  @IsOptional()
  @IsString()
  modelAlias?: string;

  @ApiPropertyOptional({ description: 'Temperatura (0-1)', example: 0.7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @ApiPropertyOptional({ description: 'Máximo de tokens', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTokens?: number;
}

export class AiUsageResponseDto {
  @ApiProperty({ type: 'number', description: 'Tokens usados en el prompt' })
  promptTokens!: number;

  @ApiProperty({ type: 'number', description: 'Tokens generados en la respuesta' })
  completionTokens!: number;

  @ApiProperty({ type: 'number', description: 'Total de tokens' })
  totalTokens!: number;
}

export class GenerateTextResponseDto {
  @ApiProperty({ type: 'string', description: 'Texto generado por la IA' })
  text!: string;

  @ApiProperty({ type: () => AiUsageResponseDto, description: 'Uso de tokens' })
  usage!: AiUsageResponseDto;

  @ApiProperty({ type: 'string', description: 'Modelo usado' })
  model!: string;

  @ApiProperty({ type: 'string', description: 'Proveedor de IA' })
  provider!: string;
}

export class ChatResponseDto {
  @ApiProperty({ type: 'string', description: 'Respuesta del chat' })
  text!: string;

  @ApiProperty({ type: () => AiUsageResponseDto, description: 'Uso de tokens' })
  usage!: AiUsageResponseDto;

  @ApiProperty({ type: 'string', description: 'Modelo usado' })
  model!: string;

  @ApiProperty({ type: 'string', description: 'Proveedor de IA' })
  provider!: string;
}