export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export interface EmailLogProps {
  id: string;
  businessId: string | null;
  to: string;
  cc: string | null;
  bcc: string | null;
  subject: string;
  body: string;
  bodyHtml: string | null;
  status: EmailStatus;
  provider: string;
  providerMessageId: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
  createdBy: string | null;
}

export class EmailLog {
  private constructor(private readonly props: EmailLogProps) {}

  static create(params: {
    businessId?: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    bodyHtml?: string;
    provider?: string;
    createdBy?: string;
  }): EmailLog {
    return new EmailLog({
      id: crypto.randomUUID(),
      businessId: params.businessId ?? null,
      to: params.to,
      cc: params.cc ?? null,
      bcc: params.bcc ?? null,
      subject: params.subject,
      body: params.body,
      bodyHtml: params.bodyHtml ?? null,
      status: EmailStatus.PENDING,
      provider: params.provider ?? 'smtp',
      providerMessageId: null,
      errorMessage: null,
      sentAt: null,
      createdAt: new Date(),
      createdBy: params.createdBy ?? null,
    });
  }

  static fromProps(props: EmailLogProps): EmailLog {
    return new EmailLog(props);
  }

  markAsSent(providerMessageId: string): EmailLog {
    return new EmailLog({
      ...this.props,
      status: EmailStatus.SENT,
      providerMessageId,
      sentAt: new Date(),
    });
  }

  markAsFailed(error: string): EmailLog {
    return new EmailLog({
      ...this.props,
      status: EmailStatus.FAILED,
      errorMessage: error,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get businessId(): string | null {
    return this.props.businessId;
  }

  get to(): string {
    return this.props.to;
  }

  get cc(): string | null {
    return this.props.cc;
  }

  get bcc(): string | null {
    return this.props.bcc;
  }

  get subject(): string {
    return this.props.subject;
  }

  get body(): string {
    return this.props.body;
  }

  get bodyHtml(): string | null {
    return this.props.bodyHtml;
  }

  get status(): EmailStatus {
    return this.props.status;
  }

  get provider(): string {
    return this.props.provider;
  }

  get providerMessageId(): string | null {
    return this.props.providerMessageId;
  }

  get errorMessage(): string | null {
    return this.props.errorMessage;
  }

  get sentAt(): Date | null {
    return this.props.sentAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get createdBy(): string | null {
    return this.props.createdBy;
  }
}
