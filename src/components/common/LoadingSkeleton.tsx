import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Wrapper that announces a busy region to assistive technology. */
function Busy({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("tile space-y-3 p-6", className)} aria-hidden="true">
      <Skeleton className="h-4 w-24 rounded-full" />
      <Skeleton className="h-6 w-3/4 rounded-xl" />
      <Skeleton className="h-4 w-1/2 rounded-full" />
    </div>
  );
}

export function CardGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <Busy className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </Busy>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Busy className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="tile flex items-center gap-4 p-4" aria-hidden="true">
          <Skeleton className="size-11 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3 rounded-full" />
            <Skeleton className="h-3 w-1/5 rounded-full" />
          </div>
        </div>
      ))}
    </Busy>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Busy className="tile divide-y divide-border p-0">
      <div className="flex items-center gap-4 bg-accent/40 px-4 py-3 sm:px-5" aria-hidden="true">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1 rounded-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-4 sm:px-5" aria-hidden="true">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1 rounded-full" />
          ))}
        </div>
      ))}
    </Busy>
  );
}

/** Label + control pairs for auth and settings forms. */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Busy className="tile space-y-5 p-5 sm:p-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2" aria-hidden="true">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-2xl" aria-hidden="true" />
    </Busy>
  );
}

/** KPI row used by every dashboard. */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Busy className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="tile space-y-3 p-5" aria-hidden="true">
          <Skeleton className="size-10 rounded-2xl" />
          <Skeleton className="h-7 w-20 rounded-xl" />
          <Skeleton className="h-3 w-28 rounded-full" />
        </div>
      ))}
    </Busy>
  );
}

/** Full dashboard shell: stats, chart panel and a side list. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <StatGridSkeleton />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="tile space-y-4 p-5 sm:p-6" aria-hidden="true">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
        <ListSkeleton rows={3} />
      </div>
    </div>
  );
}

/** Placeholder that reserves the exact aspect ratio of an image. */
export function ImagePlaceholder({
  className,
  ratio = "aspect-video",
}: {
  className?: string;
  ratio?: string;
}) {
  return (
    <Skeleton
      aria-hidden="true"
      className={cn("w-full rounded-2xl", ratio, className)}
    />
  );
}
