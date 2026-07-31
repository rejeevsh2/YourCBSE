import type { LibraryResource } from "@/data/resource-center";
import { ResourceCard } from "./ResourceCard";
import type { ResourceLibraryApi } from "@/hooks/use-resource-library";

export interface ResourceRailProps {
  title: string;
  blurb?: string;
  resources: LibraryResource[];
  library: ResourceLibraryApi;
  action?: React.ReactNode;
}

/** Horizontally scrollable shelf used by recommendations and recently viewed. */
export function ResourceRail({ title, blurb, resources, library, action }: ResourceRailProps) {
  if (!resources.length) return null;

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
          {blurb ? <p className="text-sm text-muted-foreground">{blurb}</p> : null}
        </div>
        {action}
      </div>

      <ul className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
        {resources.map((resource) => (
          <li key={resource.id} className="w-[85vw] shrink-0 snap-start sm:w-80">
            <ResourceCard
              resource={resource}
              bookmarked={library.bookmarks.includes(resource.id)}
              downloaded={library.downloads.some((item) => item.resourceId === resource.id)}
              onBookmark={library.toggleBookmark}
              onDownload={library.download}
              onShare={library.share}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
