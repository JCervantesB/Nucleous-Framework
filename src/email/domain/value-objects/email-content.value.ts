export class EmailContent {
  private constructor(private readonly props: { subject: string; body: string; bodyHtml?: string }) {}

  static create(subject: string, body: string, bodyHtml?: string): EmailContent {
    return new EmailContent({ subject, body, bodyHtml });
  }

  get subject(): string {
    return this.props.subject;
  }

  get body(): string {
    return this.props.body;
  }

  get bodyHtml(): string | null {
    return this.props.bodyHtml ?? null;
  }
}