import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Agora.io
  agoraAppId: process.env.AGORA_APP_ID || '',
  agoraAppCertificate: process.env.AGORA_APP_CERTIFICATE || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // PostgreSQL
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/twam',

  // Security
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:8081').split(','),

  // Matching
  matchTimeoutMs: parseInt(process.env.MATCH_TIMEOUT_MS || '30000', 10),
  shadowBanThreshold: parseInt(process.env.SHADOW_BAN_THRESHOLD || '20', 10),
  priorityThreshold: parseInt(process.env.PRIORITY_THRESHOLD || '70', 10),
};
