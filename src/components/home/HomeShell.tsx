import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Homepage layout primitives.
 * Scoped to the marketing homepage — the portals keep the dark workspace theme.
 */

export function HomeThemeProvider({ children }: { children: ReactNode }) {
  return (
    <div className="theme-home min-h-screen bg-background text-foreground antialiased">
      {children}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Tonal background variant for rhythm between sections. */
  tone?: "default" | "muted";
  "aria-labelledby"?: string;
}

export function Section({
  children,
  className,
  id,
  tone = "default",
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-14 sm:py-16 lg:py-20",
        tone === "muted" && "bg-secondary/60",
        className,
      )}
      {...rest}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "left",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:mb-10",
        align === "left" && action && "sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div className={cn("space-y-2.5", align === "center" && "max-w-2xl")}>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]"
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning";
  className?: string;
}) {
  const tones = {
    neutral: "bg-secondary text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning-foreground",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
