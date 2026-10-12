import { createFileRoute, Link } from "@tanstack/react-router";
import { PartyPopper } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { AuthIllustration } from "@/components/auth/AuthIllustration";
import { SuccessAlert } from "@/components/auth/AuthAlert";
import { Button } from "@/components/ui/button";

const title = "Account Created — YourSchool";
const description = "Your YourSchool account is ready. Start learning right away.";

export const Route = createFileRoute("/account-created")({
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
  component: AccountCreatedPage,
});

const nextSteps = [
  "Pick your grade and subjects",
  "Set a daily study goal",
  "Open your first chapter",
];

function AccountCreatedPage() {
  return (
    <AuthShell
      title="You're all set!"
      description="Your YourSchool account has been created successfully."
      footer={
        <>
          Not you?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in to another account
          </Link>
        </>
      }
    >
      <AuthIllustration icon={PartyPopper} pulse />
      <SuccessAlert title="Account verified">
        Everything is ready — your dashboard, study streak and library are waiting.
      </SuccessAlert>

      <ol className="space-y-2 text-sm text-muted-foreground">
        {nextSteps.map((step, index) => (
          <li key={step} className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link to="/student">Go to dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/grades">Browse grades</Link>
        </Button>
      </div>
    </AuthShell>
  );
}

