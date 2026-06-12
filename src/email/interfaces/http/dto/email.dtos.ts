import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ description: 'Destinatario(s)', example: 'destinatario@example.com' })
  @IsEmail()
  to!: string;

  @ApiPropertyOptional({ description: 'Destinatarios en copia', example: ['copia@example.com'] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiPropertyOptional({ description: 'Destinatarios en copia oculta', example: ['oculto@example.com'] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @ApiProperty({ description: 'Asunto del email', example: 'Notificación importante' })
  @IsString()
  subject!: string;

  @ApiProperty({ description: 'Cuerpo del email en texto plano', example: 'Este es el mensaje...' })
  @IsString()
  body!: string;

  @ApiPropertyOptional({ description: 'Cuerpo del email en HTML', example: '<p>Este es el mensaje...</p>' })
  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @ApiPropertyOptional({ description: 'Email del remitente', example: 'remitente@miempresa.com' })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiPropertyOptional({ description: 'Nombre del remitente', example: 'Mi Empresa' })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({ description: 'Email para respuestas', example: 'respuestas@miempresa.com' })
  @IsOptional()
  @IsEmail()
  replyTo?: string;
}

export class SendTemplateEmailDto extends SendEmailDto {
  @ApiProperty({ description: 'ID de la plantilla', example: 'welcome-email' })
  @IsString()
  templateId!: string;

  @ApiPropertyOptional({ description: 'Datos para la plantilla', example: { name: 'Juan', company: 'Mi Empresa' } })
  @IsOptional()
  templateData?: Record<string, string>;
}

export class EmailLogResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'destinatario@example.com' })
  to!: string;

  @ApiPropertyOptional({ example: 'copia@example.com', nullable: true })
  cc?: string;

  @ApiPropertyOptional({ example: 'oculto@example.com', nullable: true })
  bcc?: string;

  @ApiProperty({ example: 'Notificación importante' })
  subject!: string;

  @ApiProperty({ example: 'PENDING' })
  status!: string;

  @ApiPropertyOptional({ example: 'Error al enviar', nullable: true })
  errorMessage?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:05.000Z', nullable: true })
  sentAt?: Date;
}

export class SendEmailResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  emailLogId!: string;

  @ApiPropertyOptional({ example: 'abc123def456' })
  providerMessageId?: string;
}

export class EmailLogListResponseDto {
  @ApiProperty({ type: [EmailLogResponseDto] })
  data!: EmailLogResponseDto[];

  @ApiProperty({ example: 50 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}