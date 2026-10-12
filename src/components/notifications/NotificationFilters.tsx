import { notificationCategories } from "@/data/notification-center";
import type { CategoryFilter } from "@/hooks/use-notification-center";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface NotificationFiltersProps {
  active: CategoryFilter;
  counts: Map<CategoryFilter, number>;
  onChange: (value: CategoryFilter) => void;
  unreadOnly: boolean;
  onUnreadOnlyChange: (value: boolean) => void;
  resultCount: number;
}

const filters: CategoryFilter[] = ["All", ...notificationCategories];

/** Category chip group + unread-only switch. */
export function NotificationFilters({
  active,
  counts,
  onChange,
  unreadOnly,
  onUnreadOnlyChange,
  resultCount,
}: NotificationFiltersProps) {
  return (
    <div className="tile space-y-4 p-4 sm:p-5">
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const selected = filter === active;
          const count = counts.get(filter) ?? 0;
          return (
            <Button
              key={filter}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={() => onChange(filter)}
              className={cn("rounded-2xl text-xs", selected && "shadow-[var(--shadow-glow)]")}
            >
              {filter}
              <span className="ml-1 tabular-nums opacity-70">{count}</span>
            </Button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Switch id="unread-only" checked={unreadOnly} onCheckedChange={onUnreadOnlyChange} />
          <Label htmlFor="unread-only" className="text-xs">
            Show unread only
          </Label>
        </div>
        <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
          {resultCount} notification{resultCount === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

