import { getPool } from '../db/postgres';

const DEFAULT_TRUST = 50;
const MAX_TRUST = 100;
const MIN_TRUST = 0;

export const getTrustScore = async (userId: string): Promise<number> => {
  const db = getPool();
  const result = await db.query(
    'SELECT score FROM trust_scores WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.score ?? DEFAULT_TRUST;
};

export const adjustTrustScore = async (userId: string, delta: number): Promise<number> => {
  const db = getPool();
  const current = await getTrustScore(userId);
  const next = Math.max(MIN_TRUST, Math.min(MAX_TRUST, current + delta));

  await db.query(
    `INSERT INTO trust_scores (user_id, score, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE
     SET score = $2, updated_at = NOW()`,
    [userId, next]
  );

  return next;
};

// Convenience helpers
export const rewardCompletion = (userId: string) => adjustTrustScore(userId, 2);
export const rewardPositiveRating = (userId: string) => adjustTrustScore(userId, 5);
export const penalizeReport = (userId: string) => adjustTrustScore(userId, -10);
export const penalizeViolation = (userId: string) => adjustTrustScore(userId, -20);
