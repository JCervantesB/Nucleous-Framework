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
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email' })
  @ApiResponse({ status: 200, type: () => SendEmailResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
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
  @ApiOperation({ summary: 'Enviar email con plantilla' })
  @ApiResponse({ status: 200, type: () => SendEmailResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
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
  @ApiOperation({ summary: 'Listar logs de emails' })
  @ApiResponse({ status: 200, type: () => EmailLogListResponseDto })
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
  @ApiOperation({ summary: 'Reintentar email fallido' })
  @ApiResponse({ status: 200, type: () => SendEmailResponseDto })
  @ApiResponse({ status: 404, description: 'Log no encontrado' })
  async retryEmail(
    @CurrentBusinessId() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return {
      success: false,
      emailLogId: id,
      error: 'Reintento de email pendiente de implementar - requiere buscar el log original',
    };
  }
}