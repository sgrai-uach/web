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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRedirectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (isCancelled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= tickMs) {
          return 0;
        }
        return prev - tickMs;
      });
    }, tickMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCancelled, tickMs]);

  useEffect(() => {
    if (timeLeft <= 0 && !isCancelled && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      router.push(redirectPath);
    }
  }, [timeLeft, isCancelled, redirectPath, router]);

  const cancel = useCallback(() => {
    setIsCancelled(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerRedirectNow = useCallback(() => {
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
