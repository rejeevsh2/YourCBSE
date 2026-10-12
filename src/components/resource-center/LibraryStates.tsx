import { Link } from "@tanstack/react-router";
import { BookmarkX, CloudOff, DownloadCloud, HistoryIcon, SearchX, ServerCrash } from "lucide-react";
import { StateView } from "@/components/common/StateViews";
import { Button } from "@/components/ui/button";

/** No search results for the current query / filters. */
export function NoSearchResults({ query, onReset }: { query?: string; onReset?: () => void }) {
  return (
    <StateView
      icon={<SearchX className="size-6" />}
      title={query ? `No results for “${query}”` : "No resources match those filters"}
      description="Try fewer filters, a different spelling, or browse the full category list instead."
    >
      {onReset ? (
        <Button variant="outline" className="rounded-2xl" onClick={onReset}>
          Clear filters
        </Button>
      ) : null}
      <Button asChild className="rounded-2xl">
        <Link to="/library">Browse categories</Link>
      </Button>
    </StateView>
  );
}

export function NoFavorites() {
  return (
    <StateView
      icon={<BookmarkX className="size-6" />}
      title="No favourites yet"
      description="Bookmark lessons, videos, notes, worksheets, flash cards and mind maps to build your own shelf."
    >
      <Button asChild className="rounded-2xl">
        <Link
  to="/library/search"
 search={{ q: "" }}
>Find resources</Link>
      </Button>
    </StateView>
  );
}

export function NoDownloads() {
  return (
    <StateView
      icon={<DownloadCloud className="size-6" />}
      title="Nothing downloaded yet"
      description="Save notes, worksheets and papers offline so revision keeps working without a connection."
    >
      <Button asChild className="rounded-2xl">
        <Link to="/library">Explore the library</Link>
      </Button>
    </StateView>
  );
}

export function NoRecentlyViewed() {
  return (
    <StateView
      icon={<HistoryIcon className="size-6" />}
      title="No recently viewed resources"
      description="Open any resource and it will appear here so you can pick up where you left off."
    >
      <Button asChild className="rounded-2xl">
       <Link
  to="/library/search"
  search={{ q: "" }}
>
  Start searching
</Link>
      </Button>
    </StateView>
  );
}

/** Search request failed (transport or server). */
export function SearchFailed({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const offline = message?.toLowerCase().includes("network");
  return (
    <StateView
      icon={offline ? <CloudOff className="size-6" /> : <ServerCrash className="size-6" />}
      tone={offline ? "warning" : "destructive"}
      title={offline ? "You're offline" : "Search failed"}
      description={
        message ?? "We couldn't complete that search. Check your connection and try again."
      }
    >
      {onRetry ? (
        <Button className="rounded-2xl" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </StateView>
  );
}

