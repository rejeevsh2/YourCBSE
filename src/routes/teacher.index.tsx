import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  History,
  Layers,
  ListChecks,
  PenSquare,
  PlayCircle,
  Plus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatGrid } from "@/components/common/StatCard";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { studioActivity, studioChapters, studioClasses, studioStats, studioTasks } from "@/data/teacher";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Teacher Studio — YourCBSE" },
      { name: "description", content: "Create, manage and publish CBSE learning content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudioDashboard,
});

const shortcuts = [
  { label: "Chapters", value: "38 mapped", icon: Layers, to: "/teacher/chapters" as const },
  { label: "Interactive apps", value: "12 published", icon: Boxes, to: "/teacher/interactive-apps" as const },
  { label: "Question bank", value: "480 questions", icon: ListChecks, to: "/teacher/question-bank" as const },
  { label: "Videos", value: "64 lessons", icon: PlayCircle, to: "/teacher/videos" as const },
];

const priorityTone: Record<string, string> = {
  High: "border-destructive/30 bg-destructive/12 text-destructive",
  Medium: "border-warning/30 bg-warning/12 text-warning",
  Low: "border-border bg-muted text-muted-foreground",
};

function StudioDashboard() {
  return (
    <>
      <PageHeader
        title="Teacher Studio"
        description="Your workspace for building, reviewing and publishing chapter content."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/teacher/drafts">
                <PenSquare className="size-4" /> Review drafts
              </Link>
            </Button>
            <Button asChild className="rounded-2xl">
              <Link to="/teacher/editor">
                <Plus className="size-4" /> New chapter
              </Link>
            </Button>
          </>
        }
      />

      <StatGrid items={studioStats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <StudioPanel
          title="Recent activity"
          icon={History}
          className="lg:col-span-2"
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-2xl">
              <Link to="/teacher/published">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {studioActivity.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 rounded-2xl border border-border/60 p-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <p className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold">{item.actor}</span>{" "}
                  <span className="text-muted-foreground">{item.action}</span>{" "}
                  <span className="font-medium">{item.target}</span>
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">{item.at}</span>
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Upcoming tasks" icon={CalendarClock}>
          <ul className="space-y-3">
            {studioTasks.map((task) => (
              <li key={task.id} className="space-y-1.5 rounded-2xl border border-border/60 p-3">
                <p className="text-sm font-medium">{task.title}</p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[11px] ${priorityTone[task.priority]}`}
                  >
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{task.due}</span>
                </div>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StudioPanel title="My classes" icon={Users} className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {studioClasses.slice(0, 4).map((item) => (
              <div key={item.id} className="tile tile-interactive space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading text-sm font-bold">{item.name}</p>
                  <Badge variant="secondary" className="rounded-full text-[11px]">
                    {item.students}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.subject} · next {item.nextSession}
                </p>
                <Progress value={item.progress} aria-label={`${item.name} progress`} />
                <p className="text-xs text-muted-foreground">{item.progress}% syllabus covered</p>
              </div>
            ))}
          </div>
        </StudioPanel>

        <StudioPanel title="Jump back in" icon={ArrowRight}>
          <ul className="space-y-2">
            {shortcuts.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-2 py-2 transition-colors hover:border-primary/25 hover:bg-accent/40"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <item.icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.value}</span>
                  </span>
                  <ArrowRight className="ml-auto size-4 shrink-0 text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>

      <StudioPanel
        title="Recently updated chapters"
        icon={Layers}
        action={
          <Button asChild variant="ghost" size="sm" className="rounded-2xl">
            <Link to="/teacher/chapters">
              Chapter manager <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {studioChapters.slice(0, 4).map((chapter) => (
            <li key={chapter.id} className="tile tile-interactive space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading text-sm font-bold">{chapter.title}</p>
                <StatusBadge status={chapter.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {chapter.grade} · {chapter.subject} · {chapter.version}
              </p>
              <p className="text-xs text-muted-foreground">
                {chapter.modules} modules · updated {chapter.updatedAt}
              </p>
            </li>
          ))}
        </ul>
      </StudioPanel>
    </>
  );
}
