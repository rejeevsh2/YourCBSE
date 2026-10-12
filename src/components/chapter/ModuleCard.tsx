import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { moduleIcons, moduleToneClass } from "@/components/chapter/moduleIcons";
import type { LearningModule } from "@/data/chapter";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  Completed: "bg-success/10 text-success border-success/20",
  "In progress": "bg-primary/10 text-primary border-primary/20",
  New: "bg-warning/15 text-warning border-warning/25",
  "Coming soon": "bg-secondary text-muted-foreground border-transparent",
};

/** Reusable learning module tile used by every section of the chapter page. */
export function ModuleCard({ module }: { module: LearningModule }) {
  const Icon = moduleIcons[module.icon] ?? ArrowUpRight;

  return (
    <article className="h-full">
      <button
        type="button"
        aria-label={`Open ${module.title}`}
        className={cn(
          "tile tile-interactive group flex h-full w-full flex-col gap-3 p-5 text-left",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
              moduleToneClass[module.tone],
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          {module.status ? (
            <Badge variant="outline" className={cn("shrink-0", statusTone[module.status])}>
              {module.status}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1">
          <h3 className="font-heading text-base font-semibold text-foreground">{module.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{module.description}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-muted-foreground">{module.meta}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
            Open
            <ArrowUpRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </button>
    </article>
  );
}

