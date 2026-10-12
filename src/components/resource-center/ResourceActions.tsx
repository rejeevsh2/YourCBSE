import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ResourceActionsProps {
  resourceId: string;
  title: string;
  bookmarked: boolean;
  downloaded: boolean;
  onBookmark: (id: string) => void;
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
  /** `compact` renders icon-only buttons for dense cards. */
  variant?: "compact" | "full";
  className?: string;
}

/** Open / Bookmark / Download / Share — one implementation for every surface. */
export const ResourceActions = memo(function ResourceActions({
  resourceId,
  title,
  bookmarked,
  downloaded,
  onBookmark,
  onDownload,
  onShare,
  variant = "compact",
  className,
}: ResourceActionsProps) {
  const compact = variant === "compact";
  const BookmarkIcon = bookmarked ? BookmarkCheck : Bookmark;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button asChild size={compact ? "sm" : "default"} className="rounded-2xl">
        <Link to="/library/resource/$resourceId" params={{ resourceId }}>
          Open
        </Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        size={compact ? "icon" : "default"}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? `Remove ${title} from favourites` : `Bookmark ${title}`}
        className={cn("rounded-2xl", compact && "min-h-9 min-w-9")}
        onClick={() => onBookmark(resourceId)}
      >
        <BookmarkIcon className="size-4" aria-hidden="true" />
        {compact ? null : <span>{bookmarked ? "Saved" : "Bookmark"}</span>}
      </Button>

      <Button
        type="button"
        variant="outline"
        size={compact ? "icon" : "default"}
        aria-label={downloaded ? `${title} already downloaded` : `Download ${title}`}
        className={cn("rounded-2xl", compact && "min-h-9 min-w-9")}
        onClick={() => onDownload(resourceId)}
      >
        <Download className="size-4" aria-hidden="true" />
        {compact ? null : <span>{downloaded ? "Downloaded" : "Download"}</span>}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon" : "default"}
        aria-label={`Share ${title}`}
        className={cn("rounded-2xl", compact && "min-h-9 min-w-9")}
        onClick={() => onShare(resourceId)}
      >
        <Share2 className="size-4" aria-hidden="true" />
        {compact ? null : <span>Share</span>}
      </Button>
    </div>
  );
});

