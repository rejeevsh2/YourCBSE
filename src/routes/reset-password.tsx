import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  AuthIllustration,
  AuthShell,
  ErrorAlert,
  InfoAlert,
  PasswordInput,
  PrimaryButton,
} from "@/components/auth";
import { useAuthAction } from "@/hooks/use-auth-action";
import {
  authService,
  mergeFieldErrors,
  validateMatch,
  validatePassword,
  type FieldErrors,
} from "@/lib/auth";
import { optionalEmailSearch } from "@/lib/auth/route-search";

const title = "Reset Password — YourSchool";
const description = "Choose a new password for your YourSchool account.";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({ ...optionalEmailSearch(search), token: typeof search.token === "string" ? search.token : undefined }),
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
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { email, token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const { loading, error, fieldErrors, run } = useAuthAction(authService.resetPassword);
  const errors = mergeFieldErrors(localErrors, fieldErrors);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token || !email) { setLocalErrors({ password: "Open the complete reset link from your email." }); return; }
    const nextErrors: FieldErrors = {
      password: validatePassword(password),
      confirm: validateMatch(password, confirm),
    };
    setLocalErrors(nextErrors);
    if (nextErrors.password || nextErrors.confirm) return;

    const result = await run({ email, token, password, passwordConfirmation: confirm });
    if (!result?.ok) return;

    toast.success("Password updated", { description: "Sign in with your new password." });
    navigate({ to: "/login" });
  }

  return (
    <AuthShell
      title="Set a new password"
      description={email ? `Resetting the password for ${email}.` : "Choose a strong new password."}
      footer={
        <>
          Changed your mind?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      <AuthIllustration icon={ShieldCheck} />
      {error ? <ErrorAlert>{error}</ErrorAlert> : null}
      <InfoAlert title="Keep it secure">
        Use at least 8 characters with a mix of letters, numbers and symbols.
      </InfoAlert>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          label="New password"
          id="reset-password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          showStrength
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          label="Confirm new password"
          id="reset-confirm"
          name="password_confirmation"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          error={errors.confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
        <PrimaryButton type="submit" loading={loading} loadingText="Updating password…">
          Update password
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

