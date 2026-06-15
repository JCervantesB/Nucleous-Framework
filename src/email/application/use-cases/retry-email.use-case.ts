import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SEND_EMAIL_USE_CASE } from '../email.tokens';
import type { SendEmailUseCase } from './send-email.use-case';
import { EMAIL_LOG_REPOSITORY } from '../../domain/repositories/email-log.repository';
import type { EmailLogRepository } from '../../domain/repositories/email-log.repository';
import { EmailStatus } from '../../domain/entities/email-log.entity';

export interface RetryEmailInput {
  emailLogId: string;
}

export interface RetryEmailResult {
  success: boolean;
  emailLogId: string;
  providerMessageId?: string;
  error?: string;
}

@Injectable()
export class RetryEmailUseCase {
  constructor(
    @Inject(SEND_EMAIL_USE_CASE)
    private readonly sendEmailUseCase: SendEmailUseCase,
    @Inject(EMAIL_LOG_REPOSITORY)
    private readonly emailLogRepository: EmailLogRepository,
  ) {}

  async execute(input: RetryEmailInput): Promise<RetryEmailResult> {
    const emailLog = await this.emailLogRepository.findById(input.emailLogId);

    if (!emailLog) {
      throw new NotFoundException(
        `Email log with ID ${input.emailLogId} not found`,
      );
    }

    if (emailLog.status === EmailStatus.SENT) {
      return {
        success: false,
        emailLogId: input.emailLogId,
        error: 'Este email ya fue enviado exitosamente',
      };
    }

    const result = await this.sendEmailUseCase.execute({
      to: emailLog.to,
      cc: emailLog.cc ?? undefined,
      bcc: emailLog.bcc ?? undefined,
      subject: emailLog.subject,
      body: emailLog.body,
      bodyHtml: emailLog.bodyHtml ?? undefined,
      businessId: emailLog.businessId ?? undefined,
    });

    return {
      success: result.success,
      emailLogId: result.emailLogId ?? input.emailLogId,
      providerMessageId: result.providerMessageId,
      error: result.error,
    };
  }
}
