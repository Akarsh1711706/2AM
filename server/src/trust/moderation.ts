import { getPool } from '../db/postgres';
import { penalizeReport, penalizeViolation } from './score';

const BAN_REPORTS_THRESHOLD_48H = 2;
const BAN_REPORTS_THRESHOLD_WEEK = 3;

export const checkAndApplyModerationAction = async (reportedId: string): Promise<void> => {
  const db = getPool();

  // Count recent reports
  const last48h = await db.query(
    `SELECT COUNT(*) FROM reports
     WHERE reported_id = $1 AND created_at > NOW() - INTERVAL '48 hours'`,
    [reportedId]
  );
  const lastWeek = await db.query(
    `SELECT COUNT(*) FROM reports
     WHERE reported_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
    [reportedId]
  );

  const count48h = parseInt(last48h.rows[0].count, 10);
  const countWeek = parseInt(lastWeek.rows[0].count, 10);

  if (countWeek >= BAN_REPORTS_THRESHOLD_WEEK) {
    // Permanent ban
    await db.query(
      `INSERT INTO banned_users (user_id, reason)
       VALUES ($1, 'Too many reports in a week')
       ON CONFLICT DO NOTHING`,
      [reportedId]
    );
    await penalizeViolation(reportedId);
    console.log(`[Moderation] User ${reportedId} permanently banned`);
  } else if (count48h >= BAN_REPORTS_THRESHOLD_48H) {
    // 24h cooldown — store cooldown in Redis (handled in socket handler)
    await penalizeReport(reportedId);
    console.log(`[Moderation] User ${reportedId} on 24h cooldown`);
  }
};

export const isUserBanned = async (userId: string): Promise<boolean> => {
  const db = getPool();
  const result = await db.query(
    'SELECT 1 FROM banned_users WHERE user_id = $1',
    [userId]
  );
  return result.rows.length > 0;
};
