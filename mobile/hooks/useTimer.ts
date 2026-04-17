import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  start: (initialSeconds: number) => void;
  stop: () => void;
  reset: () => void;
}

export const useTimer = (onExpire?: () => void): UseTimerReturn => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(
    (initialSeconds: number) => {
      stop();
      setSeconds(initialSeconds);
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            stop();
            onExpireRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [stop]
  );

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
  }, [stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { seconds, isRunning, start, stop, reset };
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};
