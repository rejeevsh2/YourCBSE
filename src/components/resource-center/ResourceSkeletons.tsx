import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ResourceCardSkeleton({ row = false }: { row?: boolean }) {
  return (
    <div
      className={cn("tile flex flex-col gap-4 p-5", row && "sm:flex-row sm:items-center")}
      aria-hidden="true"
    >
      <Skeleton className={cn("rounded-2xl", row ? "size-16" : "h-28 w-full")} />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-5 w-3/4 rounded-xl" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-20 rounded-2xl" />
          <Skeleton className="h-8 w-9 rounded-2xl" />
          <Skeleton className="h-8 w-9 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function ResourceGridSkeleton({ count = 6, row = false }: { count?: number; row?: boolean }) {
  return (
    <div
      className={cn("grid gap-4", row ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3")}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading resources"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ResourceCardSkeleton key={index} row={row} />
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <ResourceGridSkeleton count={4} />
    </div>
  );
}

export function ResourceDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]" aria-busy="true" aria-live="polite">
      <div className="space-y-4">
        <Skeleton className="h-56 w-full rounded-3xl sm:h-72" />
        <Skeleton className="h-7 w-2/3 rounded-xl" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
