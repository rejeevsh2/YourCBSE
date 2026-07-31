import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bookmark,
  Clock,
  Download,
  Flame,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PanelCard, StudyTimer } from "@/components/chapter/AssistantPanel";
import { chapter, chapterBookmarks } from "@/data/chapter";
import { lessonSummary, quickResources, recentActivity } from "@/data/player";
import { cn } from "@/lib/utils";

/** Right-hand learning assistant rail for the player. Placeholder content only. */
export function PlayerAssistant({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <PanelCard title="Study timer" icon={Clock}>
        <StudyTimer />
      </PanelCard>

      <PanelCard title="Today's progress" icon={Flame}>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <p className="font-heading text-3xl font-bold text-foreground">
              {chapter.progress}
              <span className="text-lg text-muted-foreground">%</span>
            </p>
            <Badge variant="secondary">4-day streak</Badge>
          </div>
          <Progress value={chapter.progress} aria-label="Today's progress" />
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Lessons", value: "3" },
              { label: "Questions", value: "24" },
              { label: "Minutes", value: "42" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-secondary/70 px-2 py-2">
                <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
                <dd className="font-heading text-sm font-bold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PanelCard>

      <PanelCard
        title="Bookmarks"
        icon={Bookmark}
        action={
          <Link
            to="/student/bookmarks"
            className="rounded text-xs font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            View all
          </Link>
        }
      >
        <ul className="space-y-1">
          {chapterBookmarks.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="block truncate text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <span className="block text-xs text-muted-foreground">{item.meta}</span>
              </button>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard title="Continue learning" icon={ArrowRight}>
        <div className="space-y-3">
          <div className="rounded-xl bg-secondary/70 p-3">
            <p className="text-xs text-muted-foreground">{lessonSummary.lesson}</p>
            <p className="truncate font-heading text-sm font-bold text-foreground">
              {lessonSummary.title}
            </p>
            <Progress
              value={lessonSummary.progress}
              className="mt-2"
              aria-label="Lesson progress"
            />
          </div>
          <Button size="sm" className="w-full rounded-xl">
            Resume lesson
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </PanelCard>

      <PanelCard title="Recent activity" icon={Activity}>
        <ul className="space-y-2">
          {recentActivity.map((item) => (
            <li key={item.id} className="flex gap-2">
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <span className="block text-xs text-muted-foreground">{item.meta}</span>
              </span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <section
        aria-label="Ask AI"
        className="tile space-y-2 border-primary/25 bg-primary/5 p-4 text-center"
      >
        <span className="mx-auto flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <h3 className="font-heading text-sm font-bold text-foreground">Ask AI</h3>
        <p className="text-xs text-muted-foreground">
          Instant doubt solving for this chapter, arriving soon.
        </p>
        <Badge variant="secondary">Coming soon</Badge>
      </section>

      <PanelCard title="Quick resources" icon={Download}>
        <ul className="space-y-1">
          {quickResources.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">{item.meta}</span>
                </span>
                <Download className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </PanelCard>
    </div>
  );
}
