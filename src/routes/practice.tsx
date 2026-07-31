import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ListChecks, Target, Timer } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { Reveal } from "@/components/common/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { practiceSets } from "@/data/placeholder";

const title = "CBSE Practice Tests & MCQs — Classes 6 to 12 | YourCBSE";
const description =
  "Chapter-wise CBSE practice tests, MCQs and question banks with timed board-pattern sets for Classes 6 to 12.";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PracticePage,
});

const modes = [
  { icon: ListChecks, label: "Chapter MCQs", hint: "Quick 10-question drills" },
  { icon: Timer, label: "Timed mock tests", hint: "Full board-pattern papers" },
  { icon: Target, label: "Weak-area practice", hint: "Focus on what you miss" },
];

function PracticePage() {
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Practice" }]}
          title="Practice tests"
          description="Test what you've studied with chapter MCQs, timed mock papers and question banks."
        />

        <SearchAutocomplete className="max-w-lg" placeholder="Search a practice set…" />

        <ul className="grid gap-4 sm:grid-cols-3">
          {modes.map((mode) => (
            <li key={mode.label} className="tile tile-interactive flex items-center gap-3 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <mode.icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{mode.label}</span>
                <span className="block text-xs text-muted-foreground">{mode.hint}</span>
              </span>
            </li>
          ))}
        </ul>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All sets</TabsTrigger>
            <TabsTrigger value="mcq">MCQs</TabsTrigger>
            <TabsTrigger value="mock">Mock tests</TabsTrigger>
            <TabsTrigger value="bank">Question bank</TabsTrigger>
          </TabsList>
        </Tabs>

        <ul className="grid gap-4 lg:grid-cols-3">
          {practiceSets.map((set, index) => (
            <Reveal as="li" key={set.id} delay={index * 60}>
              <article className="tile tile-interactive flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ListChecks className="size-5" aria-hidden="true" />
                  </span>
                  <Badge variant="secondary">{set.difficulty}</Badge>
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    {set.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {set.grade} · {set.subject}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {set.questionCount} questions · {set.durationMinutes} min
                  </span>
                  <Button asChild size="sm" className="rounded-xl">
                    <Link to="/coming-soon">Start</Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </PublicPageShell>
    </PublicLayout>
  );
}
