import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Destinatario(s)',
    example: 'destinatario@example.com',
  })
  @IsEmail()
  to!: string;

  @ApiPropertyOptional({
    description: 'Destinatarios en copia',
    example: ['copia@example.com'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiPropertyOptional({
    description: 'Destinatarios en copia oculta',
    example: ['oculto@example.com'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @ApiProperty({
    description: 'Asunto del email',
    example: 'Notificación importante',
  })
  @IsString()
  subject!: string;

  @ApiProperty({
    description: 'Cuerpo del email en texto plano',
    example: 'Este es el mensaje...',
  })
  @IsString()
  body!: string;

  @ApiPropertyOptional({
    description: 'Cuerpo del email en HTML',
    example: '<p>Este es el mensaje...</p>',
  })
  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @ApiPropertyOptional({
    description: 'Email del remitente',
    example: 'remitente@miempresa.com',
  })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiPropertyOptional({
    description: 'Nombre del remitente',
    example: 'Mi Empresa',
  })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({
    description: 'Email para respuestas',
    example: 'respuestas@miempresa.com',
  })
  @IsOptional()
  @IsEmail()
  replyTo?: string;
}

export class SendTemplateEmailDto extends SendEmailDto {
  @ApiProperty({ description: 'ID de la plantilla', example: 'welcome-email' })
  @IsString()
  templateId!: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Datos para la plantilla',
    example: { name: 'Juan', company: 'Mi Empresa' },
  })
  @IsOptional()
  templateData?: Record<string, string>;
}

export class EmailLogResponseDto {
  @ApiProperty({ type: 'string', description: 'ID del log' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'Destinatario' })
  to!: string;

  @ApiPropertyOptional({ type: 'string', nullable: true, description: 'Copia' })
  cc?: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description: 'Copia oculta',
  })
  bcc?: string;

  @ApiProperty({ type: 'string', description: 'Asunto' })
  subject!: string;

  @ApiProperty({ type: 'string', description: 'Estado' })
  status!: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description: 'Mensaje de error',
  })
  errorMessage?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Fecha de envío',
  })
  sentAt?: Date;
}

export class SendEmailResponseDto {
  @ApiProperty({ type: 'boolean', description: 'Si fue exitoso' })
  success!: boolean;

  @ApiProperty({ type: 'string', description: 'ID del log de email' })
  emailLogId!: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'ID del mensaje del proveedor',
  })
  providerMessageId?: string;
}

export class EmailLogListResponseDto {
  @ApiProperty({ type: [EmailLogResponseDto] })
  data!: EmailLogResponseDto[];

  @ApiProperty({ type: 'number', description: 'Total de registros' })
  total!: number;

  @ApiProperty({ type: 'number', description: 'Página actual' })
  page!: number;

  @ApiProperty({ type: 'number', description: 'Elementos por página' })
  pageSize!: number;

  @ApiProperty({ type: 'number', description: 'Total de páginas' })
  totalPages!: number;
}
