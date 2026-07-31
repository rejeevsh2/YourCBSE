import { useCallback, useRef, useState } from "react";
import type { AuthResult, FieldErrors } from "@/lib/auth";

/**
 * Runs an async auth action while owning the loading / error / field-error
 * state every auth screen used to duplicate. Also guards against setting
 * state after unmount-style double submits.
 */
export function useAuthAction<TArgs extends unknown[], TData>(
  action: (...args: TArgs) => Promise<AuthResult<TData>>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args: TArgs): Promise<AuthResult<TData> | undefined> => {
      if (inFlight.current) return undefined;
      inFlight.current = true;
      setLoading(true);
      setError(null);
      setFieldErrors({});
      try {
        const result = await action(...args);
        if (!result.ok) {
          setError(result.message);
          setFieldErrors(result.fieldErrors ?? {});
        }
        return result;
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [action],
  );

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  return { loading, error, fieldErrors, setError, run, reset };
}
