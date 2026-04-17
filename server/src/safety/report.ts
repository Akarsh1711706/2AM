import { getPool } from '../db/postgres';
import { penalizeReport } from '../trust/score';
import { checkAndApplyModerationAction } from '../trust/moderation';
import { ReportCategory } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export const submitReport = async (
  reporterId: string,
  reportedId: string,
  sessionId: string,
  category: ReportCategory
): Promise<void> => {
  const db = getPool();

  // Store report
  await db.query(
    `INSERT INTO reports (id, reporter_id, reported_id, session_id, category)
     VALUES ($1, $2, $3, $4, $5)`,
    [uuidv4(), reporterId, reportedId, sessionId, category]
  );

  // Apply trust penalty
  await penalizeReport(reportedId);

  // Check for moderation escalation
  await checkAndApplyModerationAction(reportedId);

  console.log(`[Safety] Report filed: ${reporterId} → ${reportedId} (${category})`);
};
