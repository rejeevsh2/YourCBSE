import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/data/teacher";

const styles: Record<ContentStatus, string> = {
  Published: "border-success/30 bg-success/12 text-success",
  Draft: "border-warning/30 bg-warning/12 text-warning",
  "In review": "border-primary/30 bg-primary/12 text-primary",
  Archived: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: ContentStatus; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", styles[status], className)}
    >
      <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

const difficultyStyles: Record<string, string> = {
  Easy: "border-success/30 bg-success/12 text-success",
  Moderate: "border-warning/30 bg-warning/12 text-warning",
  Challenging: "border-destructive/30 bg-destructive/12 text-destructive",
};

export function DifficultyBadge({ level }: { level: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", difficultyStyles[level])}
    >
      {level}
    </Badge>
  );
}

