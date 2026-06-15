import { EmailLog, EmailStatus } from './email-log.entity';

describe('EmailLog', () => {
  describe('create', () => {
    it('debe crear un EmailLog con valores por defecto', () => {
      const emailLog = EmailLog.create({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      });

      expect(emailLog.id).toBeDefined();
      expect(emailLog.businessId).toBeNull();
      expect(emailLog.to).toBe('recipient@example.com');
      expect(emailLog.cc).toBeNull();
      expect(emailLog.bcc).toBeNull();
      expect(emailLog.subject).toBe('Test Subject');
      expect(emailLog.body).toBe('Test Body');
      expect(emailLog.bodyHtml).toBeNull();
      expect(emailLog.status).toBe(EmailStatus.PENDING);
      expect(emailLog.provider).toBe('smtp');
      expect(emailLog.providerMessageId).toBeNull();
      expect(emailLog.errorMessage).toBeNull();
      expect(emailLog.sentAt).toBeNull();
      expect(emailLog.createdBy).toBeNull();
    });

    it('debe crear un EmailLog con todos los campos opcionales', () => {
      const emailLog = EmailLog.create({
        businessId: 'business-123',
        to: 'recipient@example.com',
        cc: 'cc@example.com',
        bcc: 'bcc@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
        bodyHtml: '<p>Test Body</p>',
        provider: 'smtp',
        createdBy: 'user-123',
      });

      expect(emailLog.businessId).toBe('business-123');
      expect(emailLog.cc).toBe('cc@example.com');
      expect(emailLog.bcc).toBe('bcc@example.com');
      expect(emailLog.bodyHtml).toBe('<p>Test Body</p>');
      expect(emailLog.provider).toBe('smtp');
      expect(emailLog.createdBy).toBe('user-123');
    });
  });

  describe('fromProps', () => {
    it('debe recrear un EmailLog desde props', () => {
      const original = EmailLog.create({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      });

      const recreated = EmailLog.fromProps({
        id: original.id,
        businessId: original.businessId,
        to: original.to,
        cc: original.cc,
        bcc: original.bcc,
        subject: original.subject,
        body: original.body,
        bodyHtml: original.bodyHtml,
        status: original.status,
        provider: original.provider,
        providerMessageId: original.providerMessageId,
        errorMessage: original.errorMessage,
        sentAt: original.sentAt,
        createdAt: original.createdAt,
        createdBy: original.createdBy,
      });

      expect(recreated.id).toBe(original.id);
      expect(recreated.to).toBe(original.to);
      expect(recreated.status).toBe(EmailStatus.PENDING);
    });
  });

  describe('markAsSent', () => {
    it('debe marcar el email como enviado con messageId', () => {
      const emailLog = EmailLog.create({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      });

      const sentLog = emailLog.markAsSent('msg-123');

      expect(sentLog.status).toBe(EmailStatus.SENT);
      expect(sentLog.providerMessageId).toBe('msg-123');
      expect(sentLog.sentAt).toBeInstanceOf(Date);
    });

    it('no debe modificar el emailLog original', () => {
      const emailLog = EmailLog.create({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      });

      emailLog.markAsSent('msg-123');

      expect(emailLog.status).toBe(EmailStatus.PENDING);
      expect(emailLog.providerMessageId).toBeNull();
    });
  });

  describe('markAsFailed', () => {
    it('debe marcar el email como fallido con mensaje de error', () => {
      const emailLog = EmailLog.create({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      });

      const failedLog = emailLog.markAsFailed('SMTP connection timeout');

      expect(failedLog.status).toBe(EmailStatus.FAILED);
      expect(failedLog.errorMessage).toBe('SMTP connection timeout');
    });

    it('no debe modificar el emailLog original', () => {
      const emailLog = EmailLog.create({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      });

      emailLog.markAsFailed('Error');

      expect(emailLog.status).toBe(EmailStatus.PENDING);
      expect(emailLog.errorMessage).toBeNull();
    });
  });
});
