import { createFileRoute, Link } from "@tanstack/react-router";

import { CalendarDays, CheckCircle2, Flag, Target } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { usePlannerProgress } from "@/hooks/use-planner-progress";

import { cn } from "@/lib/utils";
import { monthlyGoals, reminders, todayPlan, weeklyPlan } from "@/data/student-library";
import { upcomingTests } from "@/data/student";

export const Route = createFileRoute("/student/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — YourCBSE" },
      { name: "description", content: "Plan today, this week and this month around your exams." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlannerPage,
});

const tagTone = {
  Learn: "bg-accent text-accent-foreground",
  Practice: "bg-success/12 text-success",
  Revise: "bg-warning/12 text-warning",
  Test: "bg-destructive/12 text-destructive",
} as const;

function PlannerPage() {
  const { done, toggleTask, totalMinutes, doneMinutes, goalPercent } = usePlannerProgress();


  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Study planner"
      description="Your daily checklist, weekly rhythm and monthly targets in one place."
      actions={
        <Button variant="outline" className="rounded-2xl" asChild>
          <Link to="/student/calendar">
            <CalendarDays className="size-4" /> Open calendar
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="tile space-y-4 p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Target className="size-4 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-base font-bold">Today's goal</h2>
            <Badge variant="secondary" className="ml-auto rounded-full">
              {doneMinutes} / {totalMinutes} min
            </Badge>
          </div>
          <Progress value={goalPercent} aria-label="Today's plan progress" />
          <ul className="space-y-2">
            {todayPlan.map((task) => {
              const checked = done.includes(task.id);
              return (
                <li
                  key={task.id}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 p-3 transition-colors hover:bg-accent/40"
                >
                  <Checkbox
                    id={task.id}
                    className="mt-0.5"
                    checked={checked}
                    onCheckedChange={(value) => toggleTask(task.id, value === true)}
                  />

                  <label htmlFor={task.id} className="min-w-0 flex-1 cursor-pointer">
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        checked && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">{task.meta}</span>
                  </label>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", tagTone[task.tag])}>
                      {task.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">{task.minutes}m</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <StudioPanel title="Reminders" icon={Flag}>
          <ul className="space-y-3">
            {reminders.map((reminder) => {
              const Icon = reminder.icon;
              return (
                <li key={reminder.id} className="flex items-center gap-3 rounded-2xl border border-border/70 p-3">
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">{reminder.meta}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </StudioPanel>
      </div>

      <StudioPanel title="Weekly plan" icon={CalendarDays}>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {weeklyPlan.map((day) => (
            <li
              key={day.id}
              className={cn(
                "rounded-2xl border p-4",
                day.state === "today"
                  ? "border-primary/40 bg-accent/50"
                  : "border-border/70",
              )}
            >
              <div className="flex items-baseline justify-between">
                <p className="font-heading text-sm font-bold">{day.day}</p>
                <p className="text-xs text-muted-foreground">{day.date}</p>
              </div>
              <p className="mt-2 text-sm">{day.focus}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {day.tasks} tasks · {day.minutes} min
              </p>
              {day.state === "done" ? (
                <p className="mt-2 flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" /> Completed
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </StudioPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Monthly plan" icon={Target}>
          <ul className="space-y-4">
            {monthlyGoals.map((goal) => (
              <li key={goal.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium">{goal.title}</p>
                  <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} aria-label={goal.title} />
                <p className="text-xs text-muted-foreground">{goal.meta}</p>
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Upcoming exams" icon={Flag}>
          <ul className="space-y-4">
            {upcomingTests.map((test) => (
              <li key={test.id} className="flex gap-3">
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <span className="font-heading text-sm font-bold">{test.date}</span>
                  <span className="text-[10px] tracking-wide uppercase">{test.day}</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate text-sm font-semibold">{test.title}</p>
                  <p className="text-xs text-muted-foreground">{test.meta}</p>
                  <Progress value={test.readiness} aria-label={`${test.title} readiness`} />
                  <p className="text-[11px] text-muted-foreground">Readiness {test.readiness}%</p>
                </div>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
