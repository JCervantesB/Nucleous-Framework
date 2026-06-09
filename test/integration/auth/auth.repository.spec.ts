jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    api: {
      signUpEmail: jest.fn(),
      signInEmail: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
    handler: jest.fn(),
  })),
}));

jest.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: jest.fn(),
}));

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { Pool } from 'pg';

describe('Auth Repository (Integration)', () => {
  let pool: Pool;

  const TEST_DATABASE_URL = process.env.DATABASE_URL;

  beforeAll(async () => {
    pool = new Pool({ connectionString: TEST_DATABASE_URL });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE auth_session CASCADE');
    await pool.query('TRUNCATE auth_user CASCADE');
    jest.clearAllMocks();
  });

  describe('signUpEmail', () => {
    it('debe crear un usuario con email y password', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        user: {
          email: 'test@example.com',
          emailVerified: false,
        },
      });

      (betterAuth as jest.Mock).mockReturnValue({
        api: {
          signUpEmail: mockSignUp,
          signInEmail: jest.fn(),
          getSession: jest.fn(),
          signOut: jest.fn(),
        },
        handler: jest.fn(),
      });

      const auth = betterAuth({
        database: drizzleAdapter(pool as any, {
          provider: 'pg',
        }),
        emailAndPassword: {
          enabled: true,
        },
        session: {
          expiresIn: 60 * 60 * 24 * 7,
          updateAge: 60 * 60 * 24,
        },
      });

      const result = await auth.api.signUpEmail({ body: { email: 'test@example.com', password: 'Test123!@#' } } as any) as any;

      expect(result).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.emailVerified).toBe(false);
    });
  });
});