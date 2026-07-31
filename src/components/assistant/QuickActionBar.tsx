import { assistantQuickActions, type AssistantQuickAction } from "@/data/ai-assistant";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionBarProps {
  onSelect: (action: AssistantQuickAction) => void;
  limit?: number;
  className?: string;
  /** Renders as a wrapping grid instead of a single scroll row. */
  layout?: "row" | "grid";
}

/** Shortcut buttons that seed the composer with a ready-made prompt. */
export function QuickActionBar({ onSelect, limit, className, layout = "row" }: QuickActionBarProps) {
  const actions = limit ? assistantQuickActions.slice(0, limit) : assistantQuickActions;

  return (
    <div
      role="group"
      aria-label="AI quick actions"
      className={cn(
        layout === "row"
          ? "-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1"
          : "grid grid-cols-2 gap-2 sm:grid-cols-3",
        className,
      )}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSelect(action)}
            title={action.prompt}
            className={cn(
              "rounded-2xl text-xs font-medium",
              layout === "row" ? "shrink-0 snap-start" : "h-auto justify-start py-2 text-left",
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className={layout === "grid" ? "truncate" : undefined}>{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
