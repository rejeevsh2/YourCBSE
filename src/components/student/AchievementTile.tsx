import { Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AchievementBadge } from "@/data/student";

const tone = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/12 text-destructive",
} as const;

export function AchievementTile({ badge }: { badge: AchievementBadge }) {
  const Icon = badge.icon;

  return (
    <article
      className={cn(
        "tile flex h-full flex-col gap-4 p-5 text-center",
        badge.earned ? "tile-interactive" : "opacity-80",
      )}
    >
      <span
        className={cn(
          "mx-auto flex size-16 items-center justify-center rounded-3xl",
          badge.earned ? tone[badge.tone] : "bg-muted text-muted-foreground",
        )}
      >
        {badge.earned ? <Icon className="size-7" aria-hidden="true" /> : <Lock className="size-6" aria-hidden="true" />}
      </span>

      <div className="space-y-1">
        <h3 className="font-heading text-sm font-bold">{badge.title}</h3>
        <p className="text-xs text-muted-foreground">{badge.description}</p>
      </div>

      <div className="mt-auto">
        {badge.earned ? (
          <p className="text-[11px] font-bold tracking-wide text-success uppercase">
            Earned {badge.earnedOn}
          </p>
        ) : (
          <div className="space-y-2">
            <Progress value={badge.progress ?? 0} aria-label={`${badge.title} progress`} />
            <p className="text-[11px] text-muted-foreground">{badge.progress ?? 0}% complete</p>
          </div>
        )}
      </div>
    </article>
  );
}
