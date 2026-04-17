import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const SESSION_ID_KEY = '@2am_session_id';
const SESSION_TOKEN_PREFIX = '@2am_session_token_';
const FIRST_TIME_KEY = '@2am_first_time';
const TRUST_SCORE_KEY = '@2am_trust_score';

export interface UseSessionReturn {
  userId: string | null;
  isFirstTime: boolean;
  trustScore: number;
  getSessionToken: (partnerId: string) => Promise<string>;
  dismissFirstTime: () => Promise<void>;
  updateTrustScore: (delta: number) => void;
}

export const useSession = (): UseSessionReturn => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [trustScore, setTrustScore] = useState(50);

  useEffect(() => {
    const init = async () => {
      let id = await AsyncStorage.getItem(SESSION_ID_KEY);
      if (!id) {
        id = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${Date.now()}-${Math.random()}`
        );
        await AsyncStorage.setItem(SESSION_ID_KEY, id);
      }
      setUserId(id);

      const firstTime = await AsyncStorage.getItem(FIRST_TIME_KEY);
      setIsFirstTime(firstTime === null);

      const storedScore = await AsyncStorage.getItem(TRUST_SCORE_KEY);
      if (storedScore) {
        setTrustScore(parseInt(storedScore, 10));
      }
    };
    init();
  }, []);

  const getSessionToken = async (partnerId: string): Promise<string> => {
    const tokenKey = SESSION_TOKEN_PREFIX + partnerId;
    const existing = await AsyncStorage.getItem(tokenKey);
    if (existing) return existing;

    const token = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${userId}-${partnerId}-${Date.now()}`
    );
    // Expire after 24h
    await AsyncStorage.setItem(tokenKey, token);
    return token;
  };

  const dismissFirstTime = async (): Promise<void> => {
    await AsyncStorage.setItem(FIRST_TIME_KEY, 'seen');
    setIsFirstTime(false);
  };

  const updateTrustScore = (delta: number): void => {
    setTrustScore((prev) => {
      const next = Math.max(0, Math.min(100, prev + delta));
      AsyncStorage.setItem(TRUST_SCORE_KEY, String(next));
      return next;
    });
  };

  return { userId, isFirstTime, trustScore, getSessionToken, dismissFirstTime, updateTrustScore };
};
