import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ListTodo } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { calendarEvents, eventTone } from "@/data/student-library";

export const Route = createFileRoute("/student/calendar")({
  head: () => ({
    meta: [
      { title: "Study Calendar — YourCBSE" },
      { name: "description", content: "See tests, classes and revision blocks for the month ahead." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CalendarPage,
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_IN_MONTH = 31;
const FIRST_WEEKDAY_OFFSET = 5; // 1 Aug 2026 falls on a Saturday
const TODAY = 1;

function CalendarPage() {
  const cells = [
    ...Array.from({ length: FIRST_WEEKDAY_OFFSET }, () => null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, index) => index + 1),
  ];

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Calendar"
      description="August 2026 — tests, live classes, assignments and revision blocks."
      actions={
        <Button variant="outline" className="rounded-2xl" asChild>
          <Link to="/student/planner">
            <ListTodo className="size-4" /> Study planner
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="tile space-y-4 p-4 sm:p-6 lg:col-span-2" aria-label="Month view">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-base font-bold">August 2026</h2>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) return <div key={`pad-${index}`} aria-hidden="true" />;
              const events = calendarEvents.filter((event) => event.day === day);
              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-16 rounded-xl border border-border/60 p-1.5 text-left transition-colors sm:min-h-20",
                    day === TODAY && "border-primary/50 bg-accent/40",
                  )}
                >
                  <span className="text-xs font-semibold">{day}</span>
                  <ul className="mt-1 space-y-1">
                    {events.map((event) => (
                      <li
                        key={event.id}
                        title={event.title}
                        className={cn(
                          "truncate rounded-md px-1 py-0.5 text-[10px] font-medium",
                          eventTone[event.type],
                        )}
                      >
                        {event.title}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <StudioPanel title="Upcoming this month" icon={CalendarDays}>
          <ul className="space-y-3">
            {calendarEvents.map((event) => (
              <li key={event.id} className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <span className="font-heading text-sm font-bold">{event.day}</span>
                  <span className="text-[9px] uppercase">Aug</span>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{event.title}</p>
                  <p
                    className={cn(
                      "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      eventTone[event.type],
                    )}
                  >
                    {event.type}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
