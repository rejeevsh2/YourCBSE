import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Mail } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { helpTopics, supportChannels } from "@/data/legal";

const title = "Help Center — YourCBSE Support";
const description =
  "Guides, support channels and answers for students, teachers and schools using the YourCBSE platform.";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Help Center" }]}
          title="Help Center"
          description="Find your way around YourCBSE, or reach a human when you need one."
        />

        <section className="space-y-6">
          <SectionHeading eyebrow="Guides" title="Popular topics" />
          <div className="grid gap-4 sm:grid-cols-2">
            {helpTopics.map((topic) => (
              <Card key={topic.id} className="h-full transition-shadow hover:shadow-elevated">
                <CardContent className="space-y-2 p-6">
                  <h3 className="font-heading font-semibold">
                    <Link
                      to={topic.to}
                      className="rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {topic.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeading eyebrow="Support" title="Contact our team" />
          <div className="grid gap-4 lg:grid-cols-3">
            {supportChannels.map((channel) => (
              <Card key={channel.id} className="h-full">
                <CardContent className="space-y-3 p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Mail className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading font-semibold">{channel.title}</h3>
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                  <p className="text-sm font-medium text-foreground">{channel.action}</p>
                  <p className="text-xs text-muted-foreground">{channel.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card>
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <LifeBuoy className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold">Looking for a quick answer?</h2>
                <p className="text-sm text-muted-foreground">
                  Most questions are covered in our FAQ.
                </p>
              </div>
            </div>
            <Link
              to="/faq"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Browse the FAQ
            </Link>
          </CardContent>
        </Card>
      </PublicPageShell>
    </PublicLayout>
  );
}
