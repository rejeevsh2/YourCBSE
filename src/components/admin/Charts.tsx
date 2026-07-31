import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartPanel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("tile space-y-5 p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold sm:text-lg">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const barTone = {
  primary: "bg-primary/70 group-hover:bg-primary",
  success: "bg-success/70 group-hover:bg-success",
  warning: "bg-warning/70 group-hover:bg-warning",
} as const;

export function BarChart({
  data,
  labels,
  tone = "primary",
  height = "h-44",
  ariaLabel,
}: {
  data: number[];
  labels?: string[];
  tone?: keyof typeof barTone;
  height?: string;
  ariaLabel: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="space-y-2">
      <div className={cn("flex items-end gap-1.5 sm:gap-2", height)} role="img" aria-label={ariaLabel}>
        {data.map((value, index) => (
          <div key={index} className="group flex h-full flex-1 items-end">
            <span
              style={{ height: `${Math.max((value / max) * 100, 4)}%` }}
              className={cn("w-full rounded-t-lg transition-all", barTone[tone])}
              title={labels ? `${labels[index]}: ${value}` : String(value)}
            />
          </div>
        ))}
      </div>
      {labels ? (
        <div className="flex gap-1.5 sm:gap-2">
          {labels.map((label) => (
            <span
              key={label}
              className="flex-1 truncate text-center text-[10px] font-medium text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LineChart({
  data,
  labels,
  ariaLabel,
  stroke = "var(--color-primary)",
}: {
  data: number[];
  labels?: string[];
  ariaLabel: string;
  stroke?: string;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  });
  const area = `0,100 ${points.join(" ")} 100,100`;

  return (
    <div className="space-y-2">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-44 w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <polygon points={area} fill={stroke} opacity="0.12" />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {labels ? (
        <div className="flex gap-1">
          {labels.map((label) => (
            <span
              key={label}
              className="flex-1 truncate text-center text-[10px] font-medium text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const segmentTone = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
} as const;

export function SegmentedBar({
  items,
  ariaLabel,
}: {
  items: { id: string; label: string; value: number; tone: keyof typeof segmentTone }[];
  ariaLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={ariaLabel}>
        {items.map((entry) => (
          <span
            key={entry.id}
            style={{ width: `${entry.value}%` }}
            className={segmentTone[entry.tone]}
          />
        ))}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((entry) => (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className={cn("size-2.5 shrink-0 rounded-full", segmentTone[entry.tone])}
            />
            <span className="truncate text-muted-foreground">{entry.label}</span>
            <span className="ml-auto font-semibold">{entry.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RankedBars({
  items,
  ariaLabel,
}: {
  items: { id: string; label: string; caption?: string; value: string; share: number }[];
  ariaLabel: string;
}) {
  return (
    <ul className="space-y-4" aria-label={ariaLabel}>
      {items.map((entry) => (
        <li key={entry.id} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-medium">{entry.label}</p>
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">
              {entry.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary/70"
              style={{ width: `${entry.share}%` }}
            />
          </div>
          {entry.caption ? (
            <p className="text-[11px] text-muted-foreground">{entry.caption}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
