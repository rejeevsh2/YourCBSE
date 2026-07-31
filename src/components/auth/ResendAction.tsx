import { SecondaryButton, type LoadingButtonProps } from "@/components/auth/AuthButtons";
import { useCountdown } from "@/hooks/use-countdown";
import type { AuthResult } from "@/lib/auth";
import { useState } from "react";

interface ResendActionProps extends Omit<LoadingButtonProps, "onClick" | "children"> {
  /** Seconds to wait before the action becomes available again. */
  cooldown?: number;
  label: string;
  action: () => Promise<AuthResult<unknown>>;
  onSuccess?: (message: string) => void;
  onFailure?: (message: string) => void;
  /** Render as the primary action instead of the secondary one. */
  render?: (props: {
    loading: boolean;
    expired: boolean;
    formatted: string;
    onClick: () => void;
  }) => React.ReactNode;
}

/**
 * Resend button with a shared cooldown timer — used by email verification and
 * OTP screens so the throttling behaviour stays identical.
 */
export function ResendAction({
  cooldown = 60,
  label,
  action,
  onSuccess,
  onFailure,
  render,
  ...props
}: ResendActionProps) {
  const { formatted, expired, reset } = useCountdown(cooldown);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!expired || loading) return;
    setLoading(true);
    const result = await action();
    setLoading(false);
    reset();
    if (result.ok) onSuccess?.(result.message);
    else onFailure?.(result.message);
  }

  if (render) return <>{render({ loading, expired, formatted, onClick: handleClick })}</>;

  return (
    <SecondaryButton
      type="button"
      loading={loading}
      loadingText="Sending…"
      disabled={!expired}
      onClick={handleClick}
      {...props}
    >
      {expired ? label : `Resend available in ${formatted}`}
    </SecondaryButton>
  );
}
