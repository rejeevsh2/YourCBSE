import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
import { AuthIllustration, AuthShell, InfoAlert } from "@/components/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account-pending")({
  head: () => ({ meta: [{ title: "Awaiting Approval — YourSchool" }] }),
  component: AccountPendingPage,
});

function AccountPendingPage() {
  return (
    <AuthShell title="Waiting for approval" description="Your registration has been submitted.">
      <AuthIllustration icon={Clock3} />
      <InfoAlert title="Your school administrator will review your account">
        Your administrator must approve your account and confirm your class access before you can
        sign in. No email code is required for this registration.
      </InfoAlert>
      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/contact">Contact support</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
