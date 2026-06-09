import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

const factoryFn = (data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user: unknown }>();
  const user = request.user;

  if (!user) {
    return null;
  }

  return data ? (user as Record<string, unknown>)[data] : user;
};

export const Session = createParamDecorator(factoryFn);

describe('Session Decorator (Unit)', () => {
  const createMockContext = (user: unknown) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  });

  describe('sin parametro data', () => {
    it('debe retornar el usuario completo cuando user existe', () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      const ctx = createMockContext(mockUser) as unknown as ExecutionContext;

      const result = factoryFn(undefined, ctx);

      expect(result).toEqual(mockUser);
    });

    it('debe retornar null cuando user es undefined', () => {
      const ctx = createMockContext(undefined) as unknown as ExecutionContext;

      const result = factoryFn(undefined, ctx);

      expect(result).toBeNull();
    });
  });

  describe('con parametro data', () => {
    it('debe retornar el campo especifico del usuario', () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const ctx = createMockContext(mockUser) as unknown as ExecutionContext;

      const result = factoryFn('email', ctx);

      expect(result).toBe('test@example.com');
    });

    it('debe retornar null cuando user es undefined y se pide campo', () => {
      const ctx = createMockContext(undefined) as unknown as ExecutionContext;

      const result = factoryFn('email', ctx);

      expect(result).toBeNull();
    });

    it('debe retornar undefined si el campo no existe', () => {
      const mockUser = { id: '123' };
      const ctx = createMockContext(mockUser) as unknown as ExecutionContext;

      const result = factoryFn('email', ctx);

      expect(result).toBeUndefined();
    });

    it('debe retornar el valor de un campo anidado', () => {
      const mockUser = { id: '123', profile: { role: 'admin' } };
      const ctx = createMockContext(mockUser) as unknown as ExecutionContext;

      const result = factoryFn('profile', ctx);

      expect(result).toEqual({ role: 'admin' });
    });
  });
});