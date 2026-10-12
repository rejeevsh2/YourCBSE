import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  History,
  ListChecks,
} from "lucide-react";

import {
  PublicLayout,
  PublicPageShell,
} from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

const title =
  "CBSE Practice Center | YourSchool";

const description =
  "Sign in to YourSchool to access published practice sets, submit answers, review attempts and track practice history.";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
    ],
  }),

  component: PracticePage,
});

const features = [
  {
    icon: ListChecks,
    title: "Practice sets",
    description:
      "Work through practice sets published for your learning programme.",
  },
  {
    icon: BookOpen,
    title: "Answer review",
    description:
      "Review submitted attempts and revisit questions after practice.",
  },
  {
    icon: History,
    title: "Practice history",
    description:
      "Keep your completed practice attempts together in your student account.",
  },
];

function PracticePage() {
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Practice" },
          ]}
          title="Practice Center"
          description="Practice is available inside the Student Portal so your attempts and progress stay connected to your account."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="panel p-5 sm:p-6"
              >
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <h2 className="font-heading text-lg font-semibold">
                  {feature.title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        <section className="panel mt-6 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold">
              Ready to practise?
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your student account, or create an account to get started.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/login">
                Sign in
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
            >
              <Link to="/register">
                Create account
              </Link>
            </Button>
          </div>
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}