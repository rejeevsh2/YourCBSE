import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StudioPanelProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Consistent surface for every Teacher Studio widget / info-panel card. */
export function StudioPanel({ title, icon: Icon, action, className, children }: StudioPanelProps) {
  return (
    <section className={cn("tile space-y-4 p-5 sm:p-6", className)}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="size-4 shrink-0 text-primary" /> : null}
        <h2 className="font-heading text-base font-bold sm:text-lg">{title}</h2>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

