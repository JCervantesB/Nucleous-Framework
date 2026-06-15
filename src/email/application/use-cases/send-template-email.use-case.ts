import { Injectable } from '@nestjs/common';
import {
  SendEmailUseCase,
  type SendEmailInput,
  type SendEmailOutput,
} from './send-email.use-case';

export interface TemplateEmailInput extends SendEmailInput {
  templateId: string;
  templateData: Record<string, string>;
}

@Injectable()
export class SendTemplateEmailUseCase {
  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {}

  async execute(input: TemplateEmailInput): Promise<SendEmailOutput> {
    const template = await this.loadTemplate(input.templateId);

    const interpolated = {
      subject: this.interpolate(template.subject, input.templateData),
      body: this.interpolate(template.body, input.templateData),
      bodyHtml: template.bodyHtml
        ? this.interpolate(template.bodyHtml, input.templateData)
        : undefined,
    };

    return this.sendEmailUseCase.execute({
      ...input,
      subject: interpolated.subject,
      body: interpolated.body,
      bodyHtml: interpolated.bodyHtml,
    });
  }

  private async loadTemplate(templateId: string): Promise<{
    subject: string;
    body: string;
    bodyHtml?: string;
  }> {
    return {
      subject: `Template: ${templateId}`,
      body: 'Template body',
      bodyHtml: '<p>Template body</p>',
    };
  }

  private interpolate(text: string, data: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
  }
}
