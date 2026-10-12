import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Countdown used by the resend affordances (email verification, OTP, lock
 * timer). Ticks once per second and cleans up on unmount.
 */
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemaining((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback((next = seconds) => setRemaining(next), [seconds]);

  const formatted = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60,
  ).padStart(2, "0")}`;

  return { remaining, formatted, reset, expired: remaining <= 0 };
}

