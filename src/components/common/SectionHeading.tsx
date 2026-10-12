import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={
        centered
          ? "mx-auto max-w-2xl space-y-3 text-center"
          : "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      }
    >
      <div className="space-y-3">
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-[11px] font-bold tracking-widest text-accent-foreground uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
        ) : null}
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action && !centered ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

