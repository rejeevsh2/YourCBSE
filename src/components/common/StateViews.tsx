import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  BookmarkX,
  ClipboardCheck,
  CloudOff,
  DownloadCloud,
  Inbox,
  LineChart,
  RefreshCw,
  SearchX,
  ServerCrash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StateViewProps {
  icon: ReactNode;
  title: string;
  description: string;
  tone?: "neutral" | "warning" | "destructive";
  children?: ReactNode;
  className?: string;
}

const toneClasses = {
  neutral: "bg-accent text-accent-foreground",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const;

/** Shared shell for every empty / error state so they stay visually consistent. */
export function StateView({
  icon,
  title,
  description,
  tone = "neutral",
  children,
  className,
}: StateViewProps) {
  return (
    <div
      role="status"
      className={cn(
        "tile flex flex-col items-center justify-center border-dashed px-6 py-14 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "mb-5 flex size-14 items-center justify-center rounded-2xl",
          toneClasses[tone],
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}

/** Nothing has been created yet. */
export function NoData({
  title = "Nothing here yet",
  description = "Content added by your teachers will appear in this space.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <StateView icon={<Inbox className="size-6" />} title={title} description={description}>
      {actionLabel ? (
        <Button className="rounded-2xl" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </StateView>
  );
}

/** A search or filter combination returned nothing. */
export function NoResults({
  query,
  onReset,
}: {
  query?: string;
  onReset?: () => void;
}) {
  return (
    <StateView
      icon={<SearchX className="size-6" />}
      title={query ? `No results for “${query}”` : "No matching results"}
      description="Try a different spelling, fewer filters, or browse by grade and subject instead."
    >
      {onReset ? (
        <Button variant="outline" className="rounded-2xl" onClick={onReset}>
          Clear filters
        </Button>
      ) : null}
      <Button asChild className="rounded-2xl">
        <Link to="/grades">Browse grades</Link>
      </Button>
    </StateView>
  );
}

/** The device lost its connection. */
export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <StateView
      icon={<CloudOff className="size-6" />}
      tone="warning"
      title="You're offline"
      description="Check your connection to keep studying. Downloaded material stays available offline."
    >
      <Button variant="outline" className="rounded-2xl" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </StateView>
  );
}

/** Something failed on the server side. */
export function ServerErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <StateView
      icon={<ServerCrash className="size-6" />}
      tone="destructive"
      title="Something went wrong"
      description="We couldn't load this section. Refreshing usually fixes it — if not, try again shortly."
    >
      <Button className="rounded-2xl" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Reload section
      </Button>
      <Button asChild variant="outline" className="rounded-2xl">
        <Link to="/">Go home</Link>
      </Button>
    </StateView>
  );
}

/* ---------- Domain presets ---------- */

/** Saved-items list with nothing saved yet. */
export function NoBookmarks() {
  return (
    <StateView
      icon={<BookmarkX className="size-6" />}
      title="No bookmarks yet"
      description="Tap the bookmark icon on any chapter, video or worksheet to pin it here for quick access."
    >
      <Button asChild className="rounded-2xl">
        <Link to="/library">Browse the library</Link>
      </Button>
    </StateView>
  );
}

/** Offline library with no downloaded files. */
export function NoDownloads() {
  return (
    <StateView
      icon={<DownloadCloud className="size-6" />}
      title="Nothing downloaded"
      description="Download notes and worksheets to keep studying without an internet connection."
    >
      <Button asChild className="rounded-2xl">
        <Link to="/library">Find something to download</Link>
      </Button>
    </StateView>
  );
}

/** No assignments in the current filter/period. */
export function NoAssignments() {
  return (
    <StateView
      icon={<ClipboardCheck className="size-6" />}
      title="No assignments due"
      description="You're clear for now. New assignments from your teachers will show up here."
    />
  );
}

/** No study activity recorded yet. */
export function NoActivity() {
  return (
    <StateView
      icon={<Activity className="size-6" />}
      title="No activity yet"
      description="Open a chapter or take a quick practice set — your activity timeline builds from there."
    />
  );
}

/** No progress data to chart. */
export function NoProgress() {
  return (
    <StateView
      icon={<LineChart className="size-6" />}
      title="No progress to show"
      description="Finish a lesson or a practice set and your progress charts will fill in automatically."
    >
      <Button asChild className="rounded-2xl">
        <Link to="/student/practice">Start practising</Link>
      </Button>
    </StateView>
  );
}

