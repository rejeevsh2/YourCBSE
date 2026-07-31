import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  PartyPopper,
  Save,
  Signal,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ChapterSidebar } from "@/components/chapter/ChapterSidebar";
import { ChapterTopBar } from "@/components/chapter/ChapterTopBar";
import { AssistantPanel } from "@/components/chapter/AssistantPanel";
import { ModuleCard } from "@/components/chapter/ModuleCard";
import { Reveal } from "@/components/common/Reveal";
import { adjacentChapters, chapter, moduleGroups } from "@/data/chapter";

const title = "Real Numbers — Class 10 Mathematics Chapter | YourCBSE";
const description =
  "Learn CBSE Class 10 Real Numbers with interactive lessons, videos, notes, diagrams, NCERT solutions, MCQs and previous year questions in one premium learning workspace.";

export const Route = createFileRoute("/learn/$chapterSlug")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChapterLearningPage,
});

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable <= 0 ? 0 : Math.min(100, (window.scrollY / scrollable) * 100));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return progress;
}

function ChapterHero() {
  const facts = [
    { icon: Clock, label: "Estimated time", value: chapter.readingTime },
    { icon: Signal, label: "Difficulty", value: chapter.difficulty },
    { icon: BookOpen, label: "Modules", value: "22 learning modules" },
    { icon: Target, label: "Completion", value: chapter.estimatedCompletion },
  ];

  return (
    <section aria-labelledby="chapter-title" className="tile-lg space-y-6 p-5 sm:p-7 lg:p-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{chapter.number}</Badge>
          <Badge variant="outline">{chapter.grade}</Badge>
          <Badge variant="outline">{chapter.subject}</Badge>
        </div>
        <h1
          id="chapter-title"
          className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {chapter.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {chapter.intro}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <li
            key={fact.label}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 rounded-2xl bg-secondary/60 p-3"
          >
            <span className="row-span-2 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <fact.icon className="size-4" aria-hidden="true" />
            </span>
            <p className="min-w-0 text-[11px] tracking-wide text-muted-foreground uppercase">
              {fact.label}
            </p>
            <p className="min-w-0 truncate text-sm font-semibold text-foreground">{fact.value}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Your progress</span>
          <span className="font-semibold text-primary">{chapter.progress}% complete</span>
        </div>
        <Progress value={chapter.progress} aria-label="Chapter completion" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="rounded-xl">
          Continue learning
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-xl">
          <Link to="/player/$chapterSlug" params={{ chapterSlug: chapter.slug }}>
            Open interactive player
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button size="lg" variant="ghost" className="rounded-xl">
          <Save className="size-4" aria-hidden="true" />
          Save progress
        </Button>
      </div>
    </section>
  );
}

function LearningObjectives() {
  return (
    <section aria-labelledby="objectives-title" className="tile space-y-4 p-5 sm:p-6">
      <h2 id="objectives-title" className="font-heading text-lg font-bold text-foreground">
        Learning objectives
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {chapter.objectives.map((objective) => (
          <li key={objective} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            <span className="text-sm leading-relaxed text-muted-foreground">{objective}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ChapterFooterNav() {
  return (
    <section aria-label="Chapter navigation" className="space-y-4">
      <div className="tile flex flex-col items-center gap-3 p-6 text-center">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-success/10 text-success">
          <PartyPopper className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-lg font-bold text-foreground">
          You're {100 - chapter.progress}% away from finishing this chapter
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Finish the remaining modules to unlock the chapter assessment and your completion badge.
        </p>
        <Button className="rounded-xl">Continue learning</Button>
      </div>

      <nav aria-label="Previous and next chapter" className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="tile tile-interactive group flex items-center gap-3 p-5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block text-xs tracking-wide text-muted-foreground uppercase">
              Previous
            </span>
            <span className="block truncate font-heading font-semibold text-foreground">
              {adjacentChapters.previous.title}
            </span>
            <span className="block text-xs text-muted-foreground">
              {adjacentChapters.previous.meta}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="tile tile-interactive group flex items-center gap-3 p-5 text-right focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:justify-end"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs tracking-wide text-muted-foreground uppercase">
              Next
            </span>
            <span className="block truncate font-heading font-semibold text-foreground">
              {adjacentChapters.next.title}
            </span>
            <span className="block text-xs text-muted-foreground">
              {adjacentChapters.next.meta}
            </span>
          </span>
          <ArrowRight
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      </nav>
    </section>
  );
}

function ChapterLearningPage() {
  const readingProgress = useReadingProgress();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh scroll-smooth bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to chapter content
      </a>

      <ChapterTopBar readingProgress={readingProgress} onOpenSidebar={() => setMenuOpen(true)} />

      <div className="mx-auto flex w-full max-w-[110rem] gap-6 px-3 py-6 sm:px-5 lg:px-6">
        <aside
          aria-label="Chapter contents"
          className="sticky top-16 hidden h-[calc(100dvh-5rem)] w-72 shrink-0 overflow-hidden rounded-2xl border border-border bg-card xl:block"
        >
          <ChapterSidebar />
        </aside>

        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 space-y-8">
          <ChapterHero />
          <LearningObjectives />

          {moduleGroups.map((group) => (
            <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="space-y-4 scroll-mt-24">
              <div className="space-y-1">
                <h2
                  id={`${group.id}-title`}
                  className="font-heading text-xl font-bold text-foreground sm:text-2xl"
                >
                  {group.label}
                </h2>
                <p className="text-sm text-muted-foreground">{group.summary}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {group.modules.map((module, index) => (
                  <Reveal key={module.id} delay={index * 40} className="h-full">
                    <ModuleCard module={module} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}

          <ChapterFooterNav />

          <p className="pb-4 text-center text-xs text-muted-foreground">
            Placeholder content for interface preview.{" "}
            <Link to="/resources" className="font-medium text-primary hover:underline">
              Browse the resource library
            </Link>
          </p>
        </main>

        <aside
          aria-label="Learning assistant"
          className="sticky top-16 hidden h-[calc(100dvh-5rem)] w-80 shrink-0 overflow-y-auto pb-6 2xl:block"
        >
          <AssistantPanel />
        </aside>
      </div>

      <section aria-label="Learning assistant" className="mx-auto max-w-3xl px-3 pb-10 2xl:hidden">
        <AssistantPanel />
      </section>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[19rem] p-0">
          <SheetTitle className="sr-only">Chapter contents</SheetTitle>
          <ChapterSidebar onClose={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
