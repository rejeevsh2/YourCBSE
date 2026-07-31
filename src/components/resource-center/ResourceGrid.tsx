import type { ReactNode } from "react";
import type { LibraryResource } from "@/data/resource-center";
import { Reveal } from "@/components/common/Reveal";
import { ResourceCard } from "./ResourceCard";
import { ResourceGridSkeleton } from "./ResourceSkeletons";
import type { ResourceLibraryApi } from "@/hooks/use-resource-library";
import { cn } from "@/lib/utils";

export interface ResourceGridProps {
  resources: LibraryResource[];
  library: ResourceLibraryApi;
  loading?: boolean;
  layout?: "grid" | "row";
  emptyState?: ReactNode;
  skeletonCount?: number;
  className?: string;
  label?: string;
}

/** Renders results with staggered reveals, skeletons and an empty fallback. */
export function ResourceGrid({
  resources,
  library,
  loading = false,
  layout = "grid",
  emptyState,
  skeletonCount = 6,
  className,
  label = "Resources",
}: ResourceGridProps) {
  if (loading) {
    return <ResourceGridSkeleton count={skeletonCount} row={layout === "row"} />;
  }

  if (!resources.length) {
    return <>{emptyState}</>;
  }

  return (
    <ul
      aria-label={label}
      className={cn(
        "grid gap-4",
        layout === "row" ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {resources.map((resource, index) => (
        <Reveal as="li" key={resource.id} delay={Math.min(index, 8) * 40} className="h-full">
          <ResourceCard
            resource={resource}
            layout={layout}
            bookmarked={library.bookmarks.includes(resource.id)}
            downloaded={library.downloads.some((item) => item.resourceId === resource.id)}
            onBookmark={library.toggleBookmark}
            onDownload={library.download}
            onShare={library.share}
          />
        </Reveal>
      ))}
    </ul>
  );
}
