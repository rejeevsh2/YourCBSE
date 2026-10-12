import type { StatItem } from "@/types";
import { cn } from "@/lib/utils";

const toneClass: Record<NonNullable<StatItem["tone"]>, string> = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, hint, tone = "primary" }: StatItem) {
  return (
    <div className="tile tile-interactive flex h-full min-h-[9rem] flex-col justify-between p-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-heading mt-2 text-3xl font-bold">{value}</p>
      </div>
      {hint ? (
        <span
          className={cn(
            "mt-4 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
            toneClass[tone],
          )}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}

