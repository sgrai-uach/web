'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseAutoRedirectTimerOptions {
  durationMs?: number;
  tickMs?: number;
  redirectPath: string;
}

export function useAutoRedirectTimer({
  durationMs = 5000,
  tickMs = 50,
  redirectPath,
}: UseAutoRedirectTimerOptions) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(durationMs);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCancelled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= tickMs) {
          if (timerRef.current) clearInterval(timerRef.current);
          router.push(redirectPath);
          return 0;
        }
        return prev - tickMs;
      });
    }, tickMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCancelled, redirectPath, router, tickMs]);

  const cancel = useCallback(() => {
    setIsCancelled(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const triggerRedirectNow = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.push(redirectPath);
  }, [redirectPath, router]);

  const secondsRemaining = Math.max(0, Math.ceil(timeLeft / 1000));
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / durationMs) * 100));

  return {
    isCancelled,
    secondsRemaining,
    progressPercent,
    cancel,
    triggerRedirectNow,
  };
}
