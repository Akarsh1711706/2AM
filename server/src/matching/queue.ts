import { getRedis, KEYS } from '../db/redis';
import { QueueEntry, Mood } from '../../../shared/types';

const QUEUE_TTL_SECONDS = 120; // Remove from queue after 2 min if not matched

export const addToQueue = async (entry: QueueEntry): Promise<void> => {
  const redis = await getRedis();
  const key = KEYS.queue(entry.mood);
  // Store with score = trustScore + (time bonus) for priority
  const score = entry.trustScore + Math.floor((Date.now() - entry.queuedAt) / 5000);
  await redis.zAdd(key, { score, value: JSON.stringify(entry) });
  // Set TTL on the sorted set using a background cleanup approach
  await redis.set(`${key}:ttl:${entry.userId}`, '1', { EX: QUEUE_TTL_SECONDS });
};

export const removeFromQueue = async (userId: string, mood: Mood): Promise<void> => {
  const redis = await getRedis();
  const key = KEYS.queue(mood);
  const members = await redis.zRange(key, 0, -1);
  for (const member of members) {
    const entry: QueueEntry = JSON.parse(member);
    if (entry.userId === userId) {
      await redis.zRem(key, member);
      break;
    }
  }
};

export const getQueueEntries = async (mood: Mood): Promise<QueueEntry[]> => {
  const redis = await getRedis();
  const key = KEYS.queue(mood);
  const members = await redis.zRangeWithScores(key, 0, -1, { REV: true });
  return members.map((m) => JSON.parse(m.value) as QueueEntry);
};

export const clearUserFromAllQueues = async (userId: string): Promise<void> => {
  const moods: Mood[] = ['vent', 'casual', 'advice', 'listen'];
  await Promise.all(moods.map((mood) => removeFromQueue(userId, mood)));
};
