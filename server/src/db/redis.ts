import { createClient, RedisClientType } from 'redis';
import { config } from '../config';

let redisClient: RedisClientType | null = null;

export const getRedis = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient({ url: config.redisUrl }) as RedisClientType;
    redisClient.on('error', (err) => console.error('[Redis] Error:', err));
    redisClient.on('connect', () => console.log('[Redis] Connected'));
    await redisClient.connect();
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Key helpers
export const KEYS = {
  queue: (mood: string) => `queue:${mood}`,
  session: (sessionId: string) => `session:${sessionId}`,
  sessionToken: (token: string) => `token:${token}`,
  onlineCount: () => 'stats:online_count',
  userSession: (userId: string) => `user:${userId}:session`,
  recentPairs: (userId: string) => `user:${userId}:pairs`,
};
