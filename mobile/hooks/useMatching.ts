import { useState, useEffect, useCallback } from 'react';
import { Mood, MatchFoundPayload } from '../../shared/types';
import {
  emitJoinQueue,
  emitLeaveQueue,
  onMatchFound,
  offMatchFound,
  getSocket,
} from '../services/socket';

export type MatchingStatus = 'idle' | 'searching' | 'matched' | 'timeout' | 'error';

export interface UseMatchingReturn {
  status: MatchingStatus;
  matchData: MatchFoundPayload | null;
  waitSeconds: number;
  startMatching: (userId: string, mood: Mood, sessionToken: string) => void;
  cancelMatching: (userId: string) => void;
}

const MATCH_TIMEOUT_MS = 30_000;

export const useMatching = (): UseMatchingReturn => {
  const [status, setStatus] = useState<MatchingStatus>('idle');
  const [matchData, setMatchData] = useState<MatchFoundPayload | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (status === 'searching') {
      setWaitSeconds(0);
      interval = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
      timeout = setTimeout(() => setStatus('timeout'), MATCH_TIMEOUT_MS);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [status]);

  const startMatching = useCallback(
    (userId: string, mood: Mood, sessionToken: string) => {
      setStatus('searching');
      setMatchData(null);

      // Remove any previous listener before registering a new one
      offMatchFound();
      onMatchFound((data) => {
        offMatchFound();
        setMatchData(data);
        setStatus('matched');
      });

      emitJoinQueue({ userId, mood, sessionToken });
    },
    []
  );

  const cancelMatching = useCallback((userId: string) => {
    offMatchFound();
    emitLeaveQueue(userId);
    setStatus('idle');
    setWaitSeconds(0);
  }, []);

  return { status, matchData, waitSeconds, startMatching, cancelMatching };
};
