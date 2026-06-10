import { EmailConfig } from './email.config';

describe('EmailConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('fromEnv', () => {
    it('debe crear configuración con valores por defecto cuando no hay env vars', () => {
      delete process.env.EMAIL_ENABLED;
      delete process.env.EMAIL_HOST;
      delete process.env.EMAIL_PORT;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;

      const config = EmailConfig.fromEnv();

      expect(config.isEnabled()).toBe(false);
      expect(config.getMode()).toBe('smtp');
      expect(config.getSmtpConfig().host).toBe('smtp.mailtrap.io');
      expect(config.getSmtpConfig().port).toBe(587);
      expect(config.getDefaultFrom()).toBe('noreply@nucleous.io');
      expect(config.getDefaultFromName()).toBe('Nucleous Framework');
      expect(config.getRateLimit()).toBe(60);
    });

    it('debe usar valores del entorno cuando están disponibles', () => {
      process.env.EMAIL_ENABLED = 'true';
      process.env.EMAIL_HOST = 'smtp.gmail.com';
      process.env.EMAIL_PORT = '465';
      process.env.EMAIL_SECURE = 'true';
      process.env.EMAIL_USER = 'testuser@gmail.com';
      process.env.EMAIL_PASSWORD = 'testpassword';
      process.env.EMAIL_FROM = 'custom@example.com';
      process.env.EMAIL_FROM_NAME = 'Custom Sender';
      process.env.EMAIL_MAX_PER_MINUTE = '30';
      process.env.EMAIL_MODE = 'smtp';

      const config = EmailConfig.fromEnv();

      expect(config.isEnabled()).toBe(true);
      expect(config.getMode()).toBe('smtp');
      expect(config.getSmtpConfig().host).toBe('smtp.gmail.com');
      expect(config.getSmtpConfig().port).toBe(465);
      expect(config.getSmtpConfig().secure).toBe(true);
      expect(config.getSmtpConfig().user).toBe('testuser@gmail.com');
      expect(config.getSmtpConfig().password).toBe('testpassword');
      expect(config.getDefaultFrom()).toBe('custom@example.com');
      expect(config.getDefaultFromName()).toBe('Custom Sender');
      expect(config.getRateLimit()).toBe(30);
    });

    it('debe lanzar error si EMAIL_ENABLED=true pero falta EMAIL_USER', () => {
      process.env.EMAIL_ENABLED = 'true';
      process.env.EMAIL_PASSWORD = 'testpassword';

      expect(() => EmailConfig.fromEnv()).toThrow(
        'EmailModule requiere EMAIL_USER cuando EMAIL_ENABLED=true',
      );
    });

    it('debe lanzar error si EMAIL_ENABLED=true pero falta EMAIL_PASSWORD', () => {
      process.env.EMAIL_ENABLED = 'true';
      process.env.EMAIL_USER = 'testuser';

      expect(() => EmailConfig.fromEnv()).toThrow(
        'EmailModule requiere EMAIL_PASSWORD cuando EMAIL_ENABLED=true',
      );
    });

    it('debe usar modo smtp por defecto si EMAIL_MODE no está definido', () => {
      process.env.EMAIL_ENABLED = 'true';
      process.env.EMAIL_USER = 'testuser';
      process.env.EMAIL_PASSWORD = 'testpassword';
      delete process.env.EMAIL_MODE;

      const config = EmailConfig.fromEnv();

      expect(config.getMode()).toBe('smtp');
    });
  });
});