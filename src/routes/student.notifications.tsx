import { createFileRoute } from "@tanstack/react-router";
import { CheckCheck, Settings2 } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { notificationIcons, notificationTones, studentNotifications } from "@/data/student";

export const Route = createFileRoute("/student/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — YourCBSE" },
      { name: "description", content: "New chapters, test reminders, assignments and achievements." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});

const toneClass = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/12 text-destructive",
} as const;

const preferences = [
  { id: "np1", label: "New chapter published", hint: "For your grade and subjects", on: true },
  { id: "np2", label: "Upcoming test reminders", hint: "3 days and 1 day before", on: true },
  { id: "np3", label: "Assignment deadlines", hint: "Evening before due date", on: true },
  { id: "np4", label: "Daily study reminder", hint: "Every day at 7:00 PM", on: true },
  { id: "np5", label: "Achievement unlocked", hint: "Badges and streak milestones", on: false },
];

function NotificationsPage() {
  const unread = studentNotifications.filter((item) => item.unread).length;

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Notifications"
      description={`${unread} unread updates about your chapters, tests and progress.`}
      actions={
        <Button variant="outline" className="rounded-2xl">
          <CheckCheck className="size-4" /> Mark all read
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <ul className="space-y-3 lg:col-span-2">
          {studentNotifications.map((item) => {
            const Icon = notificationIcons[item.kind];
            const tone = notificationTones[item.kind];

            return (
              <li
                key={item.id}
                className={cn(
                  "tile tile-interactive flex gap-4 p-5",
                  item.unread && "border-primary/30",
                )}
              >
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", toneClass[tone])}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-sm font-bold">{item.title}</h3>
                    {item.unread ? (
                      <Badge variant="secondary" className="rounded-full text-[10px]">
                        New
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.kind} · {item.time}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <StudioPanel title="Preferences" icon={Settings2} className="h-fit">
          <ul className="space-y-4">
            {preferences.map((preference) => (
              <li key={preference.id} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={preference.id} className="text-sm font-medium">
                    {preference.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{preference.hint}</p>
                </div>
                <Switch id={preference.id} defaultChecked={preference.on} />
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
