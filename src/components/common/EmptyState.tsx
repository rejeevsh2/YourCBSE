import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/common/StateViews";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Thin wrapper over the shared {@link StateView} shell so every empty screen
 * in the product keeps identical spacing, tone and typography.
 */
export function EmptyState({
  title,
  description = "",
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <StateView
      icon={icon ?? <Inbox className="size-6" />}
      title={title}
      description={description}
      className={className}
    >
      {actionLabel ? (
        <Button className="rounded-2xl" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </StateView>
  );
}

