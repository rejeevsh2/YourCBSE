import { cn } from "@/lib/utils";

/** GitHub-style contribution heatmap for the study streak. */
export function StreakHeatmap({
  days,
  className,
}: {
  days: { id: string; minutes: number }[];
  className?: string;
}) {
  const level = (minutes: number) => {
    if (minutes === 0) return "bg-muted";
    if (minutes <= 15) return "bg-primary/25";
    if (minutes <= 30) return "bg-primary/45";
    if (minutes <= 60) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-7 gap-1.5" role="img" aria-label="Study streak, last five weeks">
        {days.map((day) => (
          <span
            key={day.id}
            title={day.minutes === 0 ? "No study" : `${day.minutes} minutes`}
            className={cn("aspect-square rounded-md", level(day.minutes))}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Less</span>
        <span className="size-3 rounded-sm bg-muted" />
        <span className="size-3 rounded-sm bg-primary/25" />
        <span className="size-3 rounded-sm bg-primary/45" />
        <span className="size-3 rounded-sm bg-primary/70" />
        <span className="size-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}

