import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  AuthIllustration,
  AuthShell,
  ErrorAlert,
  OtpInput,
  PrimaryButton,
  ResendAction,
} from "@/components/auth";
import { useAuthAction } from "@/hooks/use-auth-action";
import { authService, saveSession } from "@/lib/auth";
import { optionalEmailSearch } from "@/lib/auth/route-search";

const title = "Verify Code — YourTeacher";
const description = "Enter the one-time verification code sent to your email or mobile number.";

export const Route = createFileRoute("/verify-otp")({
  validateSearch: optionalEmailSearch,
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
  component: VerifyOtpPage,
});

const CODE_LENGTH = 6;

function VerifyOtpPage() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { loading, error, run, reset } = useAuthAction(authService.verifyOtp);
  const activeError = localError ?? error;

  async function submit(value = code) {
    if (value.length < CODE_LENGTH) {
      setLocalError("Enter all six digits.");
      return;
    }
    setLocalError(null);
    const result = await run({ email, code: value });
    if (!result?.ok) return;
    if (result.data) saveSession(result.data);
    toast.success("Code verified");
    navigate({ to: "/account-created" });
  }

  return (
    <AuthShell
      title="Enter your code"
      description={
        email ? `We sent a 6-digit code to ${email}.` : "We sent a 6-digit verification code."
      }
      footer={
        <>
          Need help?{" "}
          <Link to="/contact" className="font-medium text-primary hover:underline">
            Contact support
          </Link>
        </>
      }
    >
      <AuthIllustration icon={Smartphone} />
      {activeError ? <ErrorAlert title="Verification failed">{activeError}</ErrorAlert> : null}

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        noValidate
      >
        <OtpInput
          value={code}
          onChange={(value) => {
            setCode(value);
            if (activeError) {
              setLocalError(null);
              reset();
            }
          }}
          onComplete={(value) => void submit(value)}
          error={activeError ? " " : undefined}
          disabled={loading}
        />

        <div className="space-y-3">
          <PrimaryButton type="submit" loading={loading} loadingText="Verifying…">
            Verify code
          </PrimaryButton>
          <ResendAction
            cooldown={60}
            label="Resend code"
            action={() => authService.resendOtp(email)}
            onSuccess={(message) => {
              setCode("");
              setLocalError(null);
              reset();
              toast(message);
            }}
            onFailure={(message) => toast.error(message)}
          />
        </div>
      </form>
    </AuthShell>
  );
}

