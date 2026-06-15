import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SendEmailUseCase } from '../../application/use-cases/send-email.use-case';
import { SendTemplateEmailUseCase } from '../../application/use-cases/send-template-email.use-case';
import { GetEmailLogsUseCase } from '../../application/use-cases/get-email-logs.use-case';
import { RetryEmailUseCase } from '../../application/use-cases/retry-email.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import {
  SendEmailDto,
  SendTemplateEmailDto,
  SendEmailResponseDto,
  EmailLogResponseDto,
  EmailLogListResponseDto,
} from './dto/email.dtos';

@ApiTags('Email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly sendTemplateEmailUseCase: SendTemplateEmailUseCase,
    private readonly getEmailLogsUseCase: GetEmailLogsUseCase,
    private readonly retryEmailUseCase: RetryEmailUseCase,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email',
    description: 'Envía un email directo usando el proveedor SMTP configurado. El email se asocia al businessId del usuario autenticado. Soporta destinatarios principales (to), copia (cc) y copia oculta (bcc). El cuerpo puede ser texto plano o HTML.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado o encolado exitosamente. Retorna el ID del log de email y el ID del mensaje del proveedor.',
    type: () => SendEmailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos - Email destinatario (to) y asunto son requeridos.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async send(
    @CurrentBusinessId() businessId: string,
    @Body() dto: SendEmailDto,
  ) {
    const result = await this.sendEmailUseCase.execute({
      businessId,
      to: dto.to,
      cc: dto.cc,
      bcc: dto.bcc,
      subject: dto.subject,
      body: dto.body,
      bodyHtml: dto.bodyHtml,
      from: dto.from,
      fromName: dto.fromName,
      replyTo: dto.replyTo,
    });

    return {
      success: result.success,
      emailLogId: result.emailLogId,
      providerMessageId: result.providerMessageId,
    };
  }

  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email con plantilla',
    description: 'Envía un email usando una plantilla predefinida. Las plantillas permiten interpolación de variables (ej: {{name}} se reemplaza con los datos enviados en templateData). El templateId identifica la plantilla a usar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado o encolado exitosamente usando la plantilla.',
    type: () => SendEmailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos - Email destinatario (to), asunto y templateId son requeridos.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async sendTemplate(
    @CurrentBusinessId() businessId: string,
    @Body() dto: SendTemplateEmailDto,
  ) {
    const result = await this.sendTemplateEmailUseCase.execute({
      businessId,
      to: dto.to,
      cc: dto.cc,
      bcc: dto.bcc,
      subject: dto.subject,
      body: dto.body,
      bodyHtml: dto.bodyHtml,
      templateId: dto.templateId,
      templateData: dto.templateData ?? {},
      from: dto.from,
      fromName: dto.fromName,
      replyTo: dto.replyTo,
    });

    return {
      success: result.success,
      emailLogId: result.emailLogId,
      providerMessageId: result.providerMessageId,
    };
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Listar logs de emails',
    description: 'Retorna una lista paginada de todos los emails enviados o intentados por el negocio. Incluye información de estado (PENDING, SENT, FAILED, BOUNCED), lo que permite auditar y hacer seguimiento de entregas. El log se asocia automáticamente al businessId del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs de email con paginación.',
    type: () => EmailLogListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async getLogs(
    @CurrentBusinessId() businessId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;

    const result = await this.getEmailLogsUseCase.execute({
      businessId,
      page: pageNum,
      pageSize: pageSizeNum,
    });

    return {
      data: result.data.map(log => ({
        id: log.id,
        to: log.to,
        cc: log.cc ?? undefined,
        bcc: log.bcc ?? undefined,
        subject: log.subject,
        status: log.status,
        errorMessage: log.errorMessage ?? undefined,
        createdAt: log.createdAt,
        sentAt: log.sentAt ?? undefined,
      } as EmailLogResponseDto)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize),
    };
  }

  @Post('logs/:id/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reintentar email fallido',
    description: 'Reintenta enviar un email que previamente falló. Busca el email original por su ID de log y vuelve a enviarlo con los mismos parámetros. Solo funciona para logs con estado FAILED.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email reenviado exitosamente o error si no se pudo reintentar.',
    type: () => SendEmailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Log de email no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async retryEmail(
    @CurrentBusinessId() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result = await this.retryEmailUseCase.execute({
      emailLogId: id,
    });

    return {
      success: result.success,
      emailLogId: result.emailLogId,
      providerMessageId: result.providerMessageId,
      error: result.error,
    };
  }
}