import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface InteractiveAppStageProps {
  title: string;
  meta: string;
  /** Placeholder message shown in the mount area. */
  message?: string;
}

/**
 * Container that will later mount the HTML/React chapter app.
 * Presentation only — the loading state is a timed placeholder.
 */
export function InteractiveAppStage({
  title,
  meta,
  message = "Interactive Chapter App will load here.",
}: InteractiveAppStageProps) {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
    }
    if (!fullscreen) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  function reload() {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "tile-lg flex flex-col overflow-hidden transition-all duration-300",
        fullscreen && "fixed inset-2 z-50 rounded-2xl shadow-2xl sm:inset-4",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Placeholder
          </Badge>
          <Button variant="ghost" size="icon" aria-label="Reload interactive app" onClick={reload}>
            <RefreshCw className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            aria-pressed={fullscreen}
            onClick={() => setFullscreen((value) => !value)}
          >
            {fullscreen ? (
              <Minimize2 className="size-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative flex-1 bg-secondary/40 p-4",
          fullscreen ? "overflow-auto" : "min-h-[22rem] sm:min-h-[28rem] lg:min-h-[32rem]",
        )}
      >
        {loading ? (
          <div className="space-y-3" aria-hidden="true">
            <Skeleton className="h-8 w-1/3 rounded-xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[18rem] animate-in flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center duration-500 fade-in">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-6" aria-hidden="true" />
            </span>
            <p className="font-heading text-lg font-semibold text-foreground">{message}</p>
            <p className="max-w-md text-sm text-muted-foreground">
              This container is ready to mount the chapter&apos;s HTML/React application once it is
              connected.
            </p>
          </div>
        )}
        <span role="status" aria-live="polite" className="sr-only">
          {loading ? "Loading interactive chapter app" : "Interactive chapter app ready"}
        </span>
      </div>
    </div>
  );
}
