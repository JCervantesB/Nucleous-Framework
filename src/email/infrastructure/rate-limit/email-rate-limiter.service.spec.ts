import { EmailRateLimiterService } from './email-rate-limiter.service';
import { EmailConfig } from '../config/email.config';

describe('EmailRateLimiterService', () => {
  let rateLimiter: EmailRateLimiterService;
  let mockConfig: Partial<EmailConfig>;

  beforeEach(() => {
    mockConfig = {
      getRateLimit: jest.fn().mockReturnValue(5),
    };

    rateLimiter = new EmailRateLimiterService(mockConfig as EmailConfig);
  });

  describe('checkLimit', () => {
    it('debe permitir solicitudes cuando están bajo el límite', async () => {
      const result = await rateLimiter.checkLimit('business-1');

      expect(result).toBe(true);
    });

    it('debe permitir solicitudes hasta alcanzar el límite', async () => {
      const businessId = 'business-limit-test';

      for (let i = 0; i < 5; i++) {
        const allowed = await rateLimiter.checkLimit(businessId);
        expect(allowed).toBe(true);
      }
    });

    it('debe bloquear solicitudes cuando se excede el límite', async () => {
      const businessId = 'business-blocked';

      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(businessId);
      }

      const result = await rateLimiter.checkLimit(businessId);

      expect(result).toBe(false);
    });

    it('debe mantener límites separados por businessId', async () => {
      const businessIdA = 'business-a';
      const businessIdB = 'business-b';

      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(businessIdA);
      }

      const resultB = await rateLimiter.checkLimit(businessIdB);

      expect(resultB).toBe(true);
    });
  });

  describe('reset', () => {
    it('debe limpiar todos los registros de rate limit', async () => {
      const businessId = 'business-reset';

      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(businessId);
      }

      rateLimiter.reset();

      const result = await rateLimiter.checkLimit(businessId);
      expect(result).toBe(true);
    });
  });
});
