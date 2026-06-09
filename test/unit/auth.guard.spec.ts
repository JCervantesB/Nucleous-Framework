import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '#app/auth/auth.guard';

describe('AuthGuard (Unit)', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard();
  });

  const createMockContext = (user: unknown): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('debe retornar true cuando user esta definido', () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const context = createMockContext(mockUser);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('debe lanzar UnauthorizedException cuando user es undefined', () => {
      const context = createMockContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('No autorizado');
    });

    it('debe retornar true cuando user es null (no es undefined)', () => {
      const context = createMockContext(null);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('debe retornar true cuando user tiene solo id', () => {
      const context = createMockContext({ id: 'abc-123' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});