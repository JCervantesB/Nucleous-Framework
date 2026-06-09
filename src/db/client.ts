import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '#app/database/schema/index.js';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://localhost:5432/nucleous',
});

export const db = drizzle(pool, { schema });
