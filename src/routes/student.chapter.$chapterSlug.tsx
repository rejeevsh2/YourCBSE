import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ListChecks,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { NotFoundView } from "@/components/common/NotFoundView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { difficultyTone, libraryChapters, type LibraryChapter } from "@/data/student-library";

const findChapter = (slug: string): LibraryChapter | undefined =>
  libraryChapters.find((item) => item.slug === slug);

export const Route = createFileRoute("/student/chapter/$chapterSlug")({
  head: ({ params }) => {
    const chapter = findChapter(params.chapterSlug);
    return {
      meta: [
        { title: chapter ? `${chapter.title} — YourCBSE` : "Chapter — YourCBSE" },
        {
          name: "description",
          content: chapter?.summary ?? "Chapter overview for YourCBSE students.",
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  notFoundComponent: ChapterNotFound,
  component: ChapterOverviewPage,
});

function ChapterNotFound() {
  return <NotFoundView />;
}

function ChapterOverviewPage() {
  const { chapterSlug } = Route.useParams();
  const chapter = findChapter(chapterSlug);
  if (!chapter) return <NotFoundView />;
  const Icon = chapter.icon;

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title={chapter.title}
      description={`${chapter.grade} · ${chapter.subject} · ${chapter.lessons} lessons`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link to="/student/learning-hub">Back to hub</Link>
          </Button>
          <Button className="rounded-2xl" asChild>
            <Link to="/learn/$chapterSlug" params={{ chapterSlug: chapter.slug }}>
              <PlayCircle className="size-4" /> Quick start
            </Link>
          </Button>
        </div>
      }
    >
      <section
        className={cn(
          "tile flex flex-col gap-5 bg-gradient-to-br p-5 sm:p-6 lg:flex-row lg:items-center",
          chapter.cover,
        )}
      >
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-card/70">
          <Icon className="size-8 text-foreground/70" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("rounded-full", difficultyTone[chapter.difficulty])}>
              {chapter.difficulty}
            </Badge>
            <Badge variant="secondary" className="gap-1 rounded-full">
              <Clock3 className="size-3" aria-hidden="true" /> {chapter.minutes} min
            </Badge>
            <Badge variant="secondary" className="gap-1 rounded-full">
              <GraduationCap className="size-3" aria-hidden="true" /> {chapter.grade}
            </Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">{chapter.summary}</p>
          <div className="max-w-md space-y-1.5">
            <Progress value={chapter.completion} aria-label="Chapter progress" />
            <p className="text-xs text-muted-foreground">
              {chapter.completion}% complete · {Math.round((chapter.lessons * chapter.completion) / 100)} of{" "}
              {chapter.lessons} lessons
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <StudioPanel title="Learning objectives" icon={ListChecks}>
            <ul className="space-y-3">
              {chapter.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </StudioPanel>

          <StudioPanel title="Resources included" icon={BookOpenCheck}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {chapter.resources.map((resource) => {
                const ResourceIcon = resource.icon;
                return (
                  <li
                    key={resource.label}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 p-3"
                  >
                    <span className="flex size-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <ResourceIcon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{resource.label}</p>
                      <p className="text-xs text-muted-foreground">{resource.count} items</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </StudioPanel>
        </div>

        <div className="space-y-4">
          <StudioPanel title="Prerequisites" icon={GraduationCap}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {chapter.prerequisites.map((item) => (
                <li key={item} className="rounded-2xl bg-accent/40 px-3 py-2 text-accent-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </StudioPanel>

          <StudioPanel title="Skills you'll learn" icon={Sparkles}>
            <ul className="flex flex-wrap gap-2">
              {chapter.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="secondary" className="rounded-full">
                    {skill}
                  </Badge>
                </li>
              ))}
            </ul>
          </StudioPanel>

          <StudioPanel title="Estimated duration" icon={Clock3}>
            <p className="font-heading text-3xl font-bold">
              {chapter.minutes}
              <span className="text-base text-muted-foreground"> min</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Across {chapter.lessons} lessons — about three focused sessions.
            </p>
            <Button asChild variant="outline" className="w-full rounded-2xl">
              <Link to="/player/$chapterSlug" params={{ chapterSlug: chapter.slug }}>
                Open player <ArrowRight className="size-4" />
              </Link>
            </Button>
          </StudioPanel>
        </div>
      </div>
    </PortalPage>
  );
}
