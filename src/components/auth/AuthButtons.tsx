import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/Spinner";
import { cn } from "@/lib/utils";

export interface LoadingButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
}

/** Button that swaps to a spinner and blocks input while an action runs. */
export function LoadingButton({
  loading,
  loadingText = "Please wait…",
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn("transition-transform active:scale-[.99]", className)}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="[&_svg]:text-current" label={loadingText} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Full-width primary action for auth forms. */
export function PrimaryButton({ className, ...props }: LoadingButtonProps) {
  return <LoadingButton className={cn("w-full", className)} {...props} />;
}

/** Full-width secondary action for auth forms. */
export function SecondaryButton({ className, ...props }: LoadingButtonProps) {
  return <LoadingButton variant="outline" className={cn("w-full", className)} {...props} />;
}

/** OAuth provider button — visual placeholder until the backend is wired up. */
export function SocialLoginButton({
  icon,
  children,
  loading,
  className,
  ...props
}: LoadingButtonProps & { icon?: ReactNode }) {
  return (
    <LoadingButton
      variant="outline"
      loading={loading}
      loadingText="Connecting…"
      className={cn("w-full gap-2", className)}
      {...props}
    >
      {icon}
      {children}
    </LoadingButton>
  );
}

/** Google mark rendered inline so no external asset is required. */
export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.6v3h3.86c2.26-2.08 3.58-5.15 3.58-8.79Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.28a12 12 0 0 0 0 10.72l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.64l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

