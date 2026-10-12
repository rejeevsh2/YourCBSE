import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, LifeBuoy, Mail, Wrench } from "lucide-react";
import { Brand } from "@/components/common/Brand";
import { Button } from "@/components/ui/button";

const title = "Scheduled Maintenance — YourTeacher";
const description =
  "YourTeacher is briefly offline for scheduled maintenance. We'll be back shortly with a faster study experience.";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: MaintenancePage,
});

const steps = [
  { label: "Database upgrade", status: "Completed" },
  { label: "Content re-indexing", status: "In progress" },
  { label: "Final checks", status: "Pending" },
];

function MaintenancePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <div className="tile w-full max-w-2xl space-y-8 p-6 text-center sm:p-10">
        <div className="flex justify-center">
          <Brand subtitle="Everything You Need to Succeed in CBSE" />
        </div>

        <div
          className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-warning/15 text-warning"
          aria-hidden="true"
        >
          <Wrench className="size-7" />
        </div>

        <div className="space-y-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            We're doing some maintenance
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            YourTeacher is briefly offline while we upgrade the platform. Your progress and bookmarks
            are safe — everything will be exactly where you left it.
          </p>
          <p className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
            <Clock className="size-4 text-primary" aria-hidden="true" />
            Estimated back online in about 30 minutes
          </p>
        </div>

        <ol className="grid gap-2 text-left sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.label} className="rounded-xl border border-border p-3">
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.status}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild className="rounded-xl">
            <Link to="/">
              <LifeBuoy className="size-4" aria-hidden="true" />
              Check again
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/contact">
              <Mail className="size-4" aria-hidden="true" />
              Contact support
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

