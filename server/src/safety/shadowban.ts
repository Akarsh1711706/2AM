import { getTrustScore } from '../trust/score';
import { config } from '../config';

export const isShadowBanned = async (userId: string): Promise<boolean> => {
  const score = await getTrustScore(userId);
  return score < config.shadowBanThreshold;
};

export const hasPriority = async (userId: string): Promise<boolean> => {
  const score = await getTrustScore(userId);
  return score > config.priorityThreshold;
};
