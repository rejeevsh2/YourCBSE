import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  PlayCircle,
  Signal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterSidebar } from "@/components/chapter/ChapterSidebar";
import { ChapterTopBar } from "@/components/chapter/ChapterTopBar";
import { PlayerAssistant } from "@/components/player/PlayerAssistant";
import { ResourceTabPanel } from "@/components/player/ResourceTabPanel";
import { FloatingToolbar } from "@/components/player/FloatingToolbar";
import { moduleIcons } from "@/components/chapter/moduleIcons";
import { adjacentChapters, chapter } from "@/data/chapter";
import { lessonSummary, playerTabs } from "@/data/player";

const title = "Interactive Chapter Player — Real Numbers | YourCBSE";
const description =
  "Study CBSE chapters in one workspace: interactive chapter apps, video lessons, notes, flash cards, worksheets, MCQs, NCERT solutions and previous year questions.";

export const Route = createFileRoute("/player/$chapterSlug")({
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
  component: ChapterPlayerPage,
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

function LessonBrief() {
  const facts = [
    { icon: Clock, label: "Estimated time", value: lessonSummary.estimatedTime },
    { icon: Signal, label: "Difficulty", value: lessonSummary.difficulty },
    { icon: PlayCircle, label: "Position", value: lessonSummary.lesson },
    { icon: Sparkles, label: "Resources", value: `${playerTabs.length} tabs` },
  ];

  return (
    <section aria-labelledby="lesson-summary" className="tile-lg space-y-6 p-5 sm:p-6">
      <div className="space-y-2">
        <h2 id="lesson-summary" className="font-heading text-xl font-bold text-foreground">
          Lesson summary
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {lessonSummary.summary}
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <fact.icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                {fact.label}
              </dt>
              <dd className="truncate text-sm font-semibold text-foreground">{fact.value}</dd>
            </span>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-heading text-sm font-bold tracking-wide text-foreground uppercase">
            Learning objectives
          </h3>
          <ul className="space-y-2">
            {lessonSummary.objectives.map((objective) => (
              <li key={objective} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-heading text-sm font-bold tracking-wide text-foreground uppercase">
            Skills covered
          </h3>
          <ul className="flex flex-wrap gap-2">
            {lessonSummary.skills.map((skill) => (
              <li key={skill}>
                <Badge variant="outline" className="rounded-full">
                  {skill}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Lesson progress</span>
              <span className="font-semibold text-primary">{lessonSummary.progress}%</span>
            </div>
            <Progress value={lessonSummary.progress} aria-label="Lesson progress" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BottomNavigation() {
  return (
    <nav
      aria-label="Chapter navigation"
      className="tile-lg grid gap-3 p-4 sm:p-5 lg:grid-cols-3"
    >
      <button
        type="button"
        className="group flex items-center gap-3 rounded-2xl border border-border p-4 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span className="block text-[11px] tracking-wide text-muted-foreground uppercase">
            Previous
          </span>
          <span className="block truncate text-sm font-semibold text-foreground">
            {adjacentChapters.previous.title}
          </span>
        </span>
      </button>

      <Button size="lg" className="h-auto rounded-2xl py-4">
        Continue learning
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>

      <button
        type="button"
        className="group flex items-center gap-3 rounded-2xl border border-border p-4 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] tracking-wide text-muted-foreground uppercase">
            Next
          </span>
          <span className="block truncate text-sm font-semibold text-foreground">
            {adjacentChapters.next.title}
          </span>
          <span className="block text-xs text-muted-foreground">{adjacentChapters.next.meta}</span>
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}

function ChapterPlayerPage() {
  const readingProgress = useReadingProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState(playerTabs[0].id);
  const stageRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-dvh scroll-smooth bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to learning content
      </a>

      <ChapterTopBar readingProgress={readingProgress} onOpenSidebar={() => setMenuOpen(true)} />

      <div className="mx-auto flex w-full max-w-[110rem] gap-6 px-3 py-6 sm:px-5 lg:px-6">
        <aside
          aria-label="Chapter contents"
          className="sticky top-16 hidden h-[calc(100dvh-5rem)] w-72 shrink-0 overflow-hidden rounded-2xl border border-border bg-card xl:block"
        >
          <ChapterSidebar />
        </aside>

        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 space-y-6">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{chapter.number}</Badge>
              <Badge variant="outline">{chapter.grade}</Badge>
              <Badge variant="outline">{chapter.subject}</Badge>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {chapter.title} · Interactive Player
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Everything for this chapter in one workspace — switch between the interactive app,
              videos, notes and practice without leaving the page.
            </p>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to="/learn/$chapterSlug" params={{ chapterSlug: chapter.slug }}>
                View chapter overview
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </header>

          <Tabs value={tab} onValueChange={setTab} className="space-y-5">
            <div
              ref={stageRef}
              className="sticky top-16 z-20 -mx-1 overflow-x-auto px-1 py-2 backdrop-blur-md"
            >
              <TabsList
                aria-label="Chapter resources"
                className="h-auto w-max flex-nowrap gap-1 rounded-2xl p-1"
              >
                {playerTabs.map((item) => {
                  const Icon = moduleIcons[item.icon] ?? Sparkles;
                  return (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className="gap-1.5 rounded-xl px-3 py-2 text-xs whitespace-nowrap transition-all duration-200 sm:text-sm"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {playerTabs.map((item) => (
              <TabsContent
                key={item.id}
                value={item.id}
                className="animate-in duration-300 fade-in slide-in-from-bottom-1 focus-visible:outline-none"
              >
                <ResourceTabPanel tab={item} />
              </TabsContent>
            ))}
          </Tabs>

          <LessonBrief />

          <PlayerAssistant className="xl:hidden" />

          <BottomNavigation />
        </main>

        <aside
          aria-label="Learning assistant"
          className="sticky top-16 hidden h-[calc(100dvh-5rem)] w-80 shrink-0 overflow-y-auto pb-6 xl:block"
        >
          <PlayerAssistant />
        </aside>
      </div>

      <FloatingToolbar />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[19rem] p-0">
          <SheetTitle className="sr-only">Chapter navigation</SheetTitle>
          <ChapterSidebar onClose={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

    </div>
  );
}
