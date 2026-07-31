import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type LaunchTone = "primary" | "success" | "warning" | "destructive";

const iconTone: Record<LaunchTone, string> = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/12 text-destructive",
};

interface LaunchCardProps {
  title: string;
  description: string;
  meta?: string;
  badge?: string;
  icon: LucideIcon;
  tone?: LaunchTone;
  onSelect?: () => void;
}

/** Reusable entry-point card used across Revision Hub, Practice Centre and the Assistant. */
export function LaunchCard({
  title,
  description,
  meta,
  badge,
  icon: Icon,
  tone = "primary",
  onSelect,
}: LaunchCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="tile tile-interactive group flex h-full w-full flex-col gap-4 p-5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start gap-3">
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", iconTone[tone])}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-sm font-bold sm:text-base">{title}</h3>
          {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        </div>
        {badge ? (
          <Badge variant="secondary" className="shrink-0 rounded-full text-[11px]">
            {badge}
          </Badge>
        ) : (
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}

export function LaunchGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
