import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import {
  AuthIllustration,
  AuthShell,
  InfoAlert,
  PrimaryButton,
  ResendAction,
  SecondaryButton,
  SuccessAlert,
} from "@/components/auth";
import { authService } from "@/lib/auth";
import { optionalEmailSearch } from "@/lib/auth/route-search";

const title = "Verify Your Email — YourTeacher";
const description = "Confirm your email address to activate your YourTeacher account.";

export const Route = createFileRoute("/verify-email")({
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
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  return (
    <AuthShell
      title="Verify your email"
      description={
        email
          ? `We sent a confirmation link to ${email}.`
          : "We sent a confirmation link to your inbox."
      }
      footer={
        <>
          Wrong address?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register again
          </Link>
        </>
      }
    >
      <AuthIllustration icon={MailCheck} pulse />

      {sent ? (
        <SuccessAlert title="Email sent">
          A fresh verification link is on its way — it can take a minute to arrive.
        </SuccessAlert>
      ) : (
        <InfoAlert title="Check your inbox">
          Click the link in the email to activate your account. Remember to check spam or promotions
          if you can't find it.
        </InfoAlert>
      )}

      <div className="space-y-3">
        <ResendAction
          cooldown={45}
          label="Resend verification email"
          action={() => authService.resendVerificationEmail(email)}
          onSuccess={() => setSent(true)}
          render={({ loading, expired, formatted, onClick }) => (
            <PrimaryButton
              type="button"
              loading={loading}
              loadingText="Sending…"
              disabled={!expired}
              onClick={onClick}
            >
              {expired ? "Resend verification email" : `Resend available in ${formatted}`}
            </PrimaryButton>
          )}
        />
        <SecondaryButton
          type="button"
          onClick={() => navigate({ to: "/verify-otp", search: email ? { email } : {} })}
        >
          Verify with a code instead
        </SecondaryButton>
      </div>
    </AuthShell>
  );
}

