import { BookOpen, GraduationCap, Layers, PlayCircle, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { assistantContext, type AssistantContext } from "@/data/ai-assistant";
import { cn } from "@/lib/utils";

/** Shows what the assistant currently "knows" about the learner's position. */
export function ContextPanel({
  context = assistantContext,
  className,
}: {
  context?: AssistantContext;
  className?: string;
}) {
  const rows = [
    { icon: GraduationCap, label: "Grade", value: context.grade },
    { icon: BookOpen, label: "Subject", value: context.subject },
    { icon: Layers, label: "Chapter", value: context.chapter },
    { icon: PlayCircle, label: "Lesson", value: context.lesson },
    { icon: Target, label: "Current topic", value: context.topic },
  ];

  return (
    <section className={cn("tile space-y-4 p-5", className)} aria-label="Current learning context">
      <header>
        <h2 className="font-heading text-sm font-bold">Learning context</h2>
        <p className="text-xs text-muted-foreground">Every answer is scoped to this.</p>
      </header>

      <ul className="space-y-2.5">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.label}
              className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3"
            >
              <span className="row-span-2 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <p className="min-w-0 text-[11px] tracking-wide text-muted-foreground uppercase">
                {row.label}
              </p>
              <p className="min-w-0 truncate text-sm font-medium" title={row.value}>
                {row.value}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Current progress</span>
          <span className="font-semibold tabular-nums">{context.progress}%</span>
        </div>
        <Progress value={context.progress} aria-label="Chapter progress" className="h-2" />
      </div>
    </section>
  );
}

