import { EmailAddress } from './email-address.value';

describe('EmailAddress', () => {
  describe('create', () => {
    it('debe crear un EmailAddress válido', () => {
      const email = EmailAddress.create('test@example.com');

      expect(email.email).toBe('test@example.com');
      expect(email.name).toBeUndefined();
    });

    it('debe crear un EmailAddress con nombre', () => {
      const email = EmailAddress.create('test@example.com', 'Test User');

      expect(email.email).toBe('test@example.com');
      expect(email.name).toBe('Test User');
    });

    it('debe normalizar el email a minúsculas', () => {
      const email = EmailAddress.create('TEST@EXAMPLE.COM');

      expect(email.email).toBe('test@example.com');
    });

    it('debe lanzar error para email inválido', () => {
      expect(() => EmailAddress.create('invalid-email')).toThrow(
        'Dirección de email inválida: invalid-email',
      );
    });

    it('debe lanzar error para email sin dominio', () => {
      expect(() => EmailAddress.create('test@')).toThrow(
        'Dirección de email inválida: test@',
      );
    });

    it('debe lanzar error para email con espacios', () => {
      expect(() => EmailAddress.create('test @example.com')).toThrow(
        'Dirección de email inválida: test @example.com',
      );
    });
  });

  describe('toString', () => {
    it('debe retornar solo email cuando no hay nombre', () => {
      const email = EmailAddress.create('test@example.com');

      expect(email.toString()).toBe('test@example.com');
    });

    it('debe retornar formato con nombre cuando existe', () => {
      const email = EmailAddress.create('test@example.com', 'Test User');

      expect(email.toString()).toBe('"Test User" <test@example.com>');
    });
  });
});