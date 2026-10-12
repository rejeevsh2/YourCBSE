import { createFileRoute, Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { AuthIllustration } from "@/components/auth/AuthIllustration";
import { ErrorAlert } from "@/components/auth/AuthAlert";
import { useCountdown } from "@/hooks/use-countdown";
import { Button } from "@/components/ui/button";

const title = "Account Locked — YourSchool";
const description = "Your YourSchool account is temporarily locked after too many sign-in attempts.";

export const Route = createFileRoute("/account-locked")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountLockedPage,
});

function AccountLockedPage() {
  const { formatted, expired } = useCountdown(300);

  return (
    <AuthShell
      title="Account temporarily locked"
      description="Too many failed sign-in attempts were detected on this account."
      footer={
        <>
          Still stuck?{" "}
          <Link to="/contact" className="font-medium text-primary hover:underline">
            Contact support
          </Link>
        </>
      }
    >
      <AuthIllustration icon={LockKeyhole} tone="destructive" />
      <ErrorAlert title="Security lock active">
        For your protection we've paused sign-in for this account. You can reset your password to
        unlock it immediately.
      </ErrorAlert>

      <div
        className="rounded-2xl border bg-muted/50 p-4 text-center"
        role="timer"
        aria-live="polite"
      >
        <p className="text-xs text-muted-foreground">
          {expired ? "You can try signing in again." : "Automatic unlock in"}
        </p>
        {!expired ? (
          <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{formatted}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link to="/forgot-password">Reset password to unlock</Link>
        </Button>
        <Button asChild variant="outline" className="w-full" disabled={!expired}>
          <Link to="/login">Back to login</Link>
        </Button>
      </div>
    </AuthShell>
  );
}

