import { v4 as uuidv4 } from 'uuid';
import { getRedis, KEYS } from '../db/redis';
import { getQueueEntries, removeFromQueue } from './queue';
import { isCompatible, assignRoles } from './compatibility';
import { QueueEntry, Mood, MatchFoundPayload, SessionPhase } from '../../../shared/types';
import { config } from '../config';

export interface MatchResult {
  sessionId: string;
  user1: QueueEntry;
  user2: QueueEntry;
  payload1: MatchFoundPayload;
  payload2: MatchFoundPayload;
}

const MOODS: Mood[] = ['vent', 'casual', 'advice', 'listen'];

export const tryMatch = async (
  newEntry: QueueEntry
): Promise<MatchResult | null> => {
  const redis = await getRedis();

  // Check for compatible moods
  for (const targetMood of MOODS) {
    if (!isCompatible(newEntry.mood, targetMood)) continue;

    const candidates = await getQueueEntries(targetMood);
    for (const candidate of candidates) {
      if (candidate.userId === newEntry.userId) continue;

      // Check shadow-ban isolation
      const newShadow = newEntry.trustScore < config.shadowBanThreshold;
      const candidateShadow = candidate.trustScore < config.shadowBanThreshold;
      if (newShadow !== candidateShadow) continue;

      // Check duplicate prevention (recent pairs)
      const recentPairs = await redis.sMembers(KEYS.recentPairs(newEntry.userId));
      if (recentPairs.includes(candidate.userId)) continue;

      // We have a match!
      await removeFromQueue(candidate.userId, targetMood);
      await removeFromQueue(newEntry.userId, newEntry.mood);

      const sessionId = uuidv4();
      const agoraChannel = `session_${sessionId.replace(/-/g, '').slice(0, 16)}`;

      const [role1, role2] = assignRoles(newEntry.mood, candidate.mood);

      const payload1: MatchFoundPayload = {
        sessionId,
        agoraChannel,
        agoraToken: generateAgoraToken(agoraChannel, newEntry.userId),
        role: role1,
        partnerMood: candidate.mood,
        partnerUserId: candidate.userId,
        phase: 'phase1' as SessionPhase,
      };

      const payload2: MatchFoundPayload = {
        sessionId,
        agoraChannel,
        agoraToken: generateAgoraToken(agoraChannel, candidate.userId),
        role: role2,
        partnerMood: newEntry.mood,
        partnerUserId: newEntry.userId,
        phase: 'phase1' as SessionPhase,
      };

      // Store session in Redis
      await redis.set(
        KEYS.session(sessionId),
        JSON.stringify({
          id: sessionId,
          user1Id: newEntry.userId,
          user2Id: candidate.userId,
          mood1: newEntry.mood,
          mood2: candidate.mood,
          phase: 'phase1',
          startedAt: Date.now(),
        }),
        { EX: 3600 }
      );

      // Record this pair to prevent re-matching for 24h
      const pairTTL = 86400;
      await redis.sAdd(KEYS.recentPairs(newEntry.userId), candidate.userId);
      await redis.expire(KEYS.recentPairs(newEntry.userId), pairTTL);
      await redis.sAdd(KEYS.recentPairs(candidate.userId), newEntry.userId);
      await redis.expire(KEYS.recentPairs(candidate.userId), pairTTL);

      return { sessionId, user1: newEntry, user2: candidate, payload1, payload2 };
    }
  }

  return null;
};

// Placeholder Agora token generation
// In production: use agora-access-token library with AGORA_APP_CERTIFICATE
const generateAgoraToken = (channel: string, userId: string): string => {
  if (!config.agoraAppCertificate) {
    return `placeholder_token_${channel}_${userId.slice(0, 8)}`;
  }
  // TODO: Integrate agora-access-token library
  // const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
  // return RtcTokenBuilder.buildTokenWithUid(appId, cert, channel, 0, RtcRole.PUBLISHER, expTime);
  return `placeholder_token_${channel}_${userId.slice(0, 8)}`;
};
