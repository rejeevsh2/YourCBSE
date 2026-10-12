import { memo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResourceCardProps {
  icon: LucideIcon;
  title: string;
  /** Secondary line, e.g. "Mathematics · 1.2 MB". */
  meta: string;
  badge: string;
  /** Small trailing note under the badge, e.g. "Saved Today". */
  footnote?: string;
  /** Optional trailing control (must carry its own accessible name). */
  action?: ReactNode;
}

/**
 * Icon + metadata tile shared by the Download and Bookmark centres.
 * Memoised because both screens render it inside filtered lists.
 */
export const ResourceCard = memo(function ResourceCard({
  icon: Icon,
  title,
  meta,
  badge,
  footnote,
  action,
}: ResourceCardProps) {
  return (
    <li className="tile tile-interactive flex gap-4 p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="truncate font-heading text-sm font-bold" title={title}>
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{meta}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="secondary" className="rounded-full text-[11px]">
            {badge}
          </Badge>
          {footnote ? <span className="text-[11px] text-muted-foreground">{footnote}</span> : null}
        </div>
      </div>
      {action}
    </li>
  );
});

