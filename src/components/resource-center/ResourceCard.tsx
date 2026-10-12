import { memo } from "react";
import { Clock, Download, Gauge } from "lucide-react";
import {
  difficultyTone,
  statusTone,
  type LibraryResource,
} from "@/data/resource-center";
import { Badge } from "@/components/ui/badge";
import { ResourceActions } from "./ResourceActions";
import { ResourceThumbnail } from "./ResourceThumbnail";
import { cn } from "@/lib/utils";

export interface ResourceCardProps {
  resource: LibraryResource;
  bookmarked: boolean;
  downloaded: boolean;
  onBookmark: (id: string) => void;
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
  layout?: "grid" | "row";
  className?: string;
}

/** The single result / library card used across every Resource Center screen. */
export const ResourceCard = memo(function ResourceCard({
  resource,
  bookmarked,
  downloaded,
  onBookmark,
  onDownload,
  onShare,
  layout = "grid",
  className,
}: ResourceCardProps) {
  const row = layout === "row";

  return (
    <article
      className={cn(
        "tile tile-interactive group flex h-full flex-col gap-4 p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5",
        row && "sm:flex-row sm:items-center",
        className,
      )}
    >
      <ResourceThumbnail
        category={resource.category}
        label={resource.title}
        size={row ? "sm" : "md"}
        className={cn(row && "sm:size-16 sm:shrink-0")}
      />

      <div className="flex flex-1 flex-col gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="rounded-full">
              {resource.category}
            </Badge>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusTone[resource.status])}>
              {resource.status}
            </span>
          </div>

          <h3 className="font-heading text-base font-bold leading-snug text-foreground" title={resource.title}>
            {resource.title}
          </h3>

          <p className="text-xs text-muted-foreground">
            {resource.grade} · {resource.subject} · {resource.chapter}
          </p>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {resource.description}
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {resource.durationMinutes} min
          </li>
          <li className="flex items-center gap-1.5">
            <Gauge className="size-3.5" aria-hidden="true" />
            <span className={cn("rounded-full px-2 py-0.5 font-medium", difficultyTone[resource.difficulty])}>
              {resource.difficulty}
            </span>
          </li>
          <li className="flex items-center gap-1.5">
            <Download className="size-3.5" aria-hidden="true" />
            {resource.downloads.toLocaleString()}
          </li>
        </ul>

        <ResourceActions
          resourceId={resource.id}
          title={resource.title}
          bookmarked={bookmarked}
          downloaded={downloaded}
          onBookmark={onBookmark}
          onDownload={onDownload}
          onShare={onShare}
        />
      </div>
    </article>
  );
});

