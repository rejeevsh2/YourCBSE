import { Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PathStep } from "@/data/student";

const stateStyles = {
  completed: {
    node: "bg-success text-success-foreground border-success",
    badge: "border-success/30 bg-success/12 text-success",
    label: "Completed",
  },
  current: {
    node: "bg-primary text-primary-foreground border-primary",
    badge: "border-primary/30 bg-primary/12 text-primary",
    label: "In progress",
  },
  locked: {
    node: "bg-muted text-muted-foreground border-border",
    badge: "border-border bg-muted text-muted-foreground",
    label: "Locked",
  },
} as const;

/** Vertical roadmap: Grade → Subject → Chapter → Lesson → Quiz → Completed. */
export function LearningPathTimeline({ steps }: { steps: PathStep[] }) {
  return (
    <ol className="relative space-y-4">
      <span
        aria-hidden="true"
        className="absolute top-6 bottom-6 left-[1.375rem] w-px bg-border sm:left-[1.625rem]"
      />
      {steps.map((step) => {
        const styles = stateStyles[step.state];
        const Icon = step.icon;

        return (
          <li key={step.id} className="relative flex gap-4">
            <span
              className={cn(
                "z-10 flex size-11 shrink-0 items-center justify-center rounded-2xl border sm:size-13",
                styles.node,
              )}
            >
              {step.state === "completed" ? (
                <Check className="size-5" aria-hidden="true" />
              ) : step.state === "locked" ? (
                <Lock className="size-4" aria-hidden="true" />
              ) : (
                <Icon className="size-5" aria-hidden="true" />
              )}
            </span>

            <div className="tile min-w-0 flex-1 space-y-3 p-5">
              <div className="flex flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    {step.stage}
                  </p>
                  <h3 className="font-heading text-base font-bold">{step.title}</h3>
                </div>
                <Badge variant="outline" className={cn("rounded-full text-[11px] font-semibold", styles.badge)}>
                  {styles.label}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">{step.detail}</p>

              {step.state !== "locked" ? (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground">{step.meta}</span>
                    <span className="font-semibold">{step.progress}%</span>
                  </div>
                  <Progress value={step.progress} aria-label={`${step.title} progress`} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{step.meta}</p>
              )}

              {step.state === "current" ? (
                <Button size="sm" className="rounded-2xl">
                  Resume
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
