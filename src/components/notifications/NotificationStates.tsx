import { BellOff, RefreshCcw, ServerCrash, WifiOff } from "lucide-react";
import { StateView } from "@/components/common/StateViews";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { NotificationError } from "@/lib/notifications";

/** Skeleton list while notifications load. */
export function NotificationSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="tile flex gap-4 p-5">
          <Skeleton className="size-10 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2 rounded-full" />
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-2/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyNotifications({ filtered }: { filtered?: boolean }) {
  return (
    <StateView
      icon={<BellOff className="size-6" />}
      title={filtered ? "Nothing in this category" : "You're all caught up"}
      description={
        filtered
          ? "Try another category or turn off the unread filter to see everything."
          : "New chapters, reminders and achievements will land here as you study."
      }
      className="py-14"
    />
  );
}

export function NotificationErrorState({
  error,
  onRetry,
}: {
  error: NotificationError;
  onRetry: () => void;
}) {
  const offline = error.code === "offline";

  return (
    <StateView
      icon={offline ? <WifiOff className="size-6" /> : <ServerCrash className="size-6" />}
      title={offline ? "Connection lost" : "Notification error"}
      description={
        error.message ||
        (offline
          ? "We can't reach your notifications while you're offline."
          : "Something went wrong while loading your notifications.")
      }
      tone={offline ? "warning" : "destructive"}
      className="py-14"
    >
      <Button variant="outline" className="rounded-2xl" onClick={onRetry}>
        <RefreshCcw className="size-4" /> Try again
      </Button>
    </StateView>
  );
}
