import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  CalendarClock,
  Clock,
  Compass,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  chapter,
  chapterBookmarks,
  moduleGroups,
  recentlyViewed,
  upcomingPractice,
} from "@/data/chapter";
import { cn } from "@/lib/utils";

export function PanelCard({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: typeof Clock;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="tile space-y-3 p-4">
      <header className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
          <Icon className="size-3.5 text-primary" aria-hidden="true" />
          {title}
        </h3>
        {action}
      </header>
      {children}
    </section>
  );
}

export function StudyTimer() {
  const [seconds, setSeconds] = useState(1_500);
  const [running, setRunning] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval.current);
  }, [running]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-3">
      <p
        className="font-heading text-3xl font-bold tabular-nums text-foreground"
        aria-live="polite"
        aria-label={`Study time ${minutes} minutes ${remainder} seconds`}
      >
        {minutes}:{remainder}
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={running ? "secondary" : "default"}
          className="flex-1 rounded-xl"
          onClick={() => setRunning((value) => !value)}
        >
          {running ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Reset study timer"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

/** Right-hand learning assistant rail. Placeholder content only. */
export function AssistantPanel({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
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

      <PanelCard title="Study timer" icon={Clock}>
        <StudyTimer />
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

      <PanelCard title="Recently viewed" icon={RotateCcw}>
        <ul className="space-y-1">
          {recentlyViewed.map((item) => (
            <li key={item.id} className="rounded-lg px-2 py-1.5">
              <span className="block truncate text-sm font-medium text-foreground">
                {item.label}
              </span>
              <span className="block text-xs text-muted-foreground">{item.meta}</span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard title="Upcoming practice" icon={CalendarClock}>
        <ul className="space-y-2">
          {upcomingPractice.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-secondary/70 px-3 py-2"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <span className="block text-xs text-muted-foreground">{item.meta}</span>
              </span>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
          <Link to="/practice">Go to practice</Link>
        </Button>
      </PanelCard>

      <PanelCard title="Quick navigation" icon={Compass}>
        <ul className="space-y-1">
          {moduleGroups.map((group) => (
            <li key={group.id}>
              <a
                href={`#${group.id}`}
                className="block rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {group.label}
              </a>
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
    </div>
  );
}
