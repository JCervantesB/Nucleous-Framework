export class EmailAddress {
  private constructor(
    private readonly props: { email: string; name?: string },
  ) {}

  static create(email: string, name?: string): EmailAddress {
    if (!this.isValidEmail(email)) {
      throw new Error(`Dirección de email inválida: ${email}`);
    }
    return new EmailAddress({ email: email.toLowerCase(), name });
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string | undefined {
    return this.props.name;
  }

  toString(): string {
    return this.props.name
      ? `"${this.props.name}" <${this.props.email}>`
      : this.props.email;
  }
}
