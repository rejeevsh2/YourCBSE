import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  achievementNotices,
  studyReminders,
  type AchievementNotice,
  type StudyReminder,
} from "@/data/notification-center";
import { cn } from "@/lib/utils";

const reminderTones: Record<StudyReminder["tone"], string> = {
  primary: "bg-primary/12 text-primary",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/12 text-destructive",
};

export function ReminderCard({ reminder }: { reminder: StudyReminder }) {
  const Icon = reminder.icon;

  return (
    <article className="tile flex h-full flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl",
            reminderTones[reminder.tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-sm font-bold">{reminder.title}</h3>
          <Badge variant="secondary" className="mt-1 rounded-full text-[10px]">
            {reminder.due}
          </Badge>
        </div>
      </div>

      <p className="flex-1 text-sm text-muted-foreground">{reminder.description}</p>

      {typeof reminder.progress === "number" ? (
        <Progress
          value={reminder.progress}
          aria-label={`${reminder.title} progress`}
          className="h-1.5"
        />
      ) : null}

      <Button asChild size="sm" variant="outline" className="w-full rounded-2xl">
        <Link to={reminder.to}>
          Open <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </article>
  );
}

export function ReminderGrid({ reminders = studyReminders }: { reminders?: StudyReminder[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reminders.map((reminder, index) => (
        <Reveal key={reminder.id} delay={index * 40} className="h-full">
          <ReminderCard reminder={reminder} />
        </Reveal>
      ))}
    </div>
  );
}

export function AchievementCard({ achievement }: { achievement: AchievementNotice }) {
  const Icon = achievement.icon;

  return (
    <article className="tile flex items-center gap-3 p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="truncate font-heading text-sm font-bold">{achievement.title}</h3>
        <p className="truncate text-xs text-muted-foreground">{achievement.description}</p>
        <p className="text-[11px] text-muted-foreground">{achievement.earnedAt}</p>
      </div>
    </article>
  );
}

export function AchievementList({
  achievements = achievementNotices,
}: {
  achievements?: AchievementNotice[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {achievements.map((achievement, index) => (
        <Reveal key={achievement.id} delay={index * 40}>
          <AchievementCard achievement={achievement} />
        </Reveal>
      ))}
    </div>
  );
}
