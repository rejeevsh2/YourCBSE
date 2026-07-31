import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import {
  AuthField,
  AuthIllustration,
  AuthShell,
  ErrorAlert,
  PrimaryButton,
  SuccessAlert,
} from "@/components/auth";
import { Button } from "@/components/ui/button";
import { useAuthAction } from "@/hooks/use-auth-action";
import { authService, mergeFieldErrors, validateEmail, type FieldErrors } from "@/lib/auth";

const title = "Forgot Password — YourCBSE";
const description = "Request a secure password reset link for your YourCBSE account.";

export const Route = createFileRoute("/forgot-password")({
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
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const { loading, error, fieldErrors, run } = useAuthAction(authService.forgotPassword);
  const errors = mergeFieldErrors(localErrors, fieldErrors);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const emailError = validateEmail(email);
    setLocalErrors({ email: emailError });
    if (emailError) return;

    const result = await run(email);
    if (result?.ok) setSent(true);
  }

  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter your registered email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <AuthIllustration icon={KeyRound} />
          <SuccessAlert title="Reset link sent">
            If an account exists for {email}, a password reset link is on its way. The link expires
            in 30 minutes.
          </SuccessAlert>
          <Button asChild className="w-full">
            <Link to="/reset-password" search={{ email }}>
              Open reset form
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {error ? <ErrorAlert>{error}</ErrorAlert> : null}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <AuthField
              label="Email"
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <PrimaryButton type="submit" loading={loading} loadingText="Sending link…">
              Send reset link
            </PrimaryButton>
          </form>
        </>
      )}
    </AuthShell>
  );
}
