import { Pool } from 'pg';
import { config } from '../config';

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({ connectionString: config.databaseUrl });
    pool.on('error', (err) => console.error('[Postgres] Pool error:', err));
  }
  return pool;
};

export const initSchema = async (): Promise<void> => {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS trust_scores (
      user_id     TEXT PRIMARY KEY,
      score       INTEGER NOT NULL DEFAULT 50,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reports (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id TEXT NOT NULL,
      reported_id TEXT NOT NULL,
      session_id  TEXT NOT NULL,
      category    TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS session_ratings (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id  TEXT NOT NULL,
      rater_id    TEXT NOT NULL,
      rated_id    TEXT NOT NULL,
      rating      TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS banned_users (
      user_id     TEXT PRIMARY KEY,
      reason      TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS reports_reported_id_idx ON reports(reported_id);
    CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at);
  `);
  console.log('[Postgres] Schema initialized');
};
