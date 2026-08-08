/**
 * useExamTimer.ts
 * Countdown timer for exam attempt pages.
 * Synchronizes based on the server-provided startedAt time to avoid client-side manipulation.
 */
import { useState, useEffect, useRef } from "react";

interface UseExamTimerOptions {
  durationMin: number;
  startedAt?: string;
  onExpire: () => void;
}

interface UseExamTimerResult {
  timeLeft: number; // seconds remaining
  formattedTime: string;
  isWarning: boolean; // ≤5 min
  isCritical: boolean; // ≤1 min
}

export function useExamTimer({
  durationMin,
  startedAt,
  onExpire,
}: UseExamTimerOptions): UseExamTimerResult {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    // Wait until we have the server timestamp to begin accurate countdown
    if (!startedAt) return;

    const durationSec = durationMin * 60;
    const startMs = new Date(startedAt).getTime();
    
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      return Math.max(0, durationSec - elapsed);
    };

    const initial = calculateTimeLeft();
    setTimeLeft(initial);

    // If already expired, trigger immediately
    if (initial <= 0) {
      onExpireRef.current();
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(id);
          onExpireRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [startedAt, durationMin]);

  // If not calculated yet, assume full duration is left
  const displayTime = timeLeft !== null ? timeLeft : durationMin * 60;

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    timeLeft: displayTime,
    formattedTime,
    isWarning: displayTime <= 300 && displayTime > 60,
    isCritical: displayTime <= 60,
  };
}
