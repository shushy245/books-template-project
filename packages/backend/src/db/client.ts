import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema.js';

export type Db = NodePgDatabase<typeof schema>;

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export const createDb = (config: DbConfig): { pool: Pool; db: Db } => {
  const pool = new Pool(config);
  const db = drizzle(pool, { schema });
  return { pool, db };
};
