import { Injectable, Inject, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';
import { EMAIL_LOG_REPOSITORY, type EmailLogRepository } from '../../domain/repositories/email-log.repository';
import { EmailLog } from '../../domain/entities/email-log.entity';
import { EmailAddress } from '../../domain/value-objects/email-address.value';

export interface SendEmailInput {
  businessId?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  createdBy?: string;
}

export interface SendEmailOutput {
  success: boolean;
  emailLogId: string;
  providerMessageId?: string;
  error?: string;
}

@Injectable()
export class SendEmailUseCase {
  private readonly logger = new Logger(SendEmailUseCase.name);

  constructor(
    private readonly emailService: EmailService,
    @Inject(EMAIL_LOG_REPOSITORY) private readonly emailLogRepo: EmailLogRepository,
  ) {}

  async execute(input: SendEmailInput): Promise<SendEmailOutput> {
    const toAddresses = Array.isArray(input.to)
      ? input.to.map(t => EmailAddress.create(t))
      : [EmailAddress.create(input.to)];

    const ccAddresses = input.cc
      ? (Array.isArray(input.cc) ? input.cc : [input.cc]).map(c => EmailAddress.create(c))
      : [];

    const bccAddresses = input.bcc
      ? (Array.isArray(input.bcc) ? input.bcc : [input.bcc]).map(b => EmailAddress.create(b))
      : [];

    const emailLog = EmailLog.create({
      businessId: input.businessId,
      to: toAddresses.map(a => a.email).join(', '),
      cc: ccAddresses.length > 0 ? ccAddresses.map(a => a.email).join(', ') : undefined,
      bcc: bccAddresses.length > 0 ? bccAddresses.map(a => a.email).join(', ') : undefined,
      subject: input.subject,
      body: input.body,
      bodyHtml: input.bodyHtml,
      createdBy: input.createdBy,
    });

    const savedLog = await this.emailLogRepo.save(emailLog);

    try {
      const result = await this.emailService.send({
        to: toAddresses,
        cc: ccAddresses,
        bcc: bccAddresses,
        subject: input.subject,
        text: input.body,
        html: input.bodyHtml,
        from: input.from,
        fromName: input.fromName,
        replyTo: input.replyTo,
        businessId: input.businessId,
      });

      const sentLog = savedLog.markAsSent(result.messageId);
      await this.emailLogRepo.update(sentLog);

      return {
        success: true,
        emailLogId: savedLog.id,
        providerMessageId: result.messageId,
      };
    } catch (error) {
      const failedLog = savedLog.markAsFailed(error.message);
      await this.emailLogRepo.update(failedLog);

      this.logger.error(`Error enviando email: ${error.message}`);

      return {
        success: false,
        emailLogId: savedLog.id,
        error: error.message,
      };
    }
  }
}