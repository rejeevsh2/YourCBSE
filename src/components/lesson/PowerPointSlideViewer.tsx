import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";

type ParsedPresentation =
  Awaited<ReturnType<(typeof import("@web-ppt/core"))["parse"]>>;

type Props = {
  contentId: number;
  title: string;
  originalFileUrl: string;
  description?: string | null;
};

export function PowerPointSlideViewer({
  contentId,
  title,
  originalFileUrl,
  description,
}: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [presentation, setPresentation] = useState<ParsedPresentation | null>(null);
  const [index, setIndex] = useState(0);
  const [slideUrl, setSlideUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Parse the presentation only when this particular slide viewer becomes
  // visible. No work is done for unrelated lessons or content types.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setPresentation(null);
    setSlideUrl(null);
    setIndex(0);
    setError(null);

    async function load() {
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/lesson-contents/${contentId}/presentation-file`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Your login has expired. Please sign in again.");
          }

          if (response.status === 403) {
            throw new Error("This presentation is not available for your account or class.");
          }

          throw new Error(
            "The presentation could not be loaded. Please try again or open the original file.",
          );
        }

        const bytes = await response.arrayBuffer();
        if (controller.signal.aborted) return;
        if (bytes.byteLength === 0) throw new Error("The uploaded presentation is empty.");

        // This optional renderer is downloaded only for PowerPoint resources.
        // It parses PPT and PPTX in the browser; no Office server is required.
        const { parse } = await import("@web-ppt/core");
        const deck = await parse(bytes);
        if (!deck.slides.length) {
          throw new Error("No slides were found in this presentation.");
        }

        if (active) {
          setPresentation(deck);
          setLoading(false);
        }
      } catch (cause) {
        if (!active || controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Could not read this presentation.");
        setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [contentId, reload]);

  // Render only the requested slide. SVG is used as an image, not injected
  // into the document as HTML, so untrusted slide markup cannot run scripts.
  useEffect(() => {
    if (!presentation) return;

    let active = true;
    let objectUrl: string | null = null;

    setSlideUrl(null);
    setRendering(true);

    async function renderSlide() {
      try {
        const { renderSlideToSvg } = await import("@web-ppt/core");
        const slide = presentation.slides[index];
        if (!slide) throw new Error("This slide could not be found.");

        const svg = renderSlideToSvg(presentation, slide, {
          idPrefix: `ys-slide-${contentId}-${index}-`,
        });

        objectUrl = URL.createObjectURL(
          new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
        );

        if (active) {
          setSlideUrl(objectUrl);
          setError(null);
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not display this slide.");
        }
      } finally {
        if (active) setRendering(false);
      }
    }

    void renderSlide();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [presentation, index, contentId]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const total = presentation?.slides.length ?? 0;
  const previous = () => setIndex((value) => Math.max(0, value - 1));
  const next = () => setIndex((value) => Math.min(total - 1, value + 1));

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (viewerRef.current?.requestFullscreen) {
        await viewerRef.current.requestFullscreen();
      }
    } catch {
      setError("Fullscreen is not available in this browser.");
    }
  }

  return (
    <section className="space-y-4">
      {description ? (
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}

      <div
        ref={viewerRef}
        tabIndex={0}
        aria-label={`PowerPoint slide viewer: ${title}`}
        onKeyDown={(event) => {
          if (!presentation) return;
          if (event.key === "ArrowLeft" || event.key === "PageUp") {
            event.preventDefault();
            previous();
          } else if (event.key === "ArrowRight" || event.key === "PageDown") {
            event.preventDefault();
            next();
          }
        }}
        className="overflow-hidden rounded-2xl border bg-background outline-offset-4 focus-visible:outline-2 fullscreen:flex fullscreen:flex-col fullscreen:justify-center fullscreen:bg-background"
      >
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2">
          <span className="text-sm font-semibold">Slide viewer</span>
          <div className="flex items-center gap-2">
            {total > 0 ? (
              <span className="text-xs font-semibold tabular-nums" aria-live="polite">
                Slide {index + 1} of {total}
              </span>
            ) : null}
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => void toggleFullscreen()}
              disabled={!presentation}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen presentation"}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
            </Button>
          </div>
        </div>

        <div className="relative flex aspect-video w-full items-center justify-center bg-muted/30 fullscreen:min-h-0 fullscreen:flex-1">
          {loading ? (
            <div role="status" className="flex flex-col items-center gap-3 p-5 text-center">
              <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
              <p className="text-sm">Preparing presentation slides…</p>
              <p className="text-xs text-muted-foreground">
                Large presentations may take longer on mobile connections.
              </p>
            </div>
          ) : slideUrl && !rendering ? (
            <img
              src={slideUrl}
              alt={`${title}, slide ${index + 1} of ${total}`}
              className="h-full w-full object-contain"
            />
          ) : !error ? (
            <Loader2 className="size-7 animate-spin text-primary" aria-label="Rendering slide" />
          ) : null}

          {error ? (
            <div role="alert" className="max-w-md space-y-3 p-5 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setReload((value) => value + 1)}
              >
                <RefreshCw aria-hidden />
                Try again
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-background px-4 py-3">
          <Button type="button" variant="outline" size="sm" onClick={previous}
            disabled={!presentation || index === 0}>
            <ChevronLeft aria-hidden />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Use arrow keys to change slides</span>
          <Button type="button" size="sm" onClick={next}
            disabled={!presentation || index >= total - 1}>
            Next
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>

      <Button variant="outline" size="sm" className="max-w-full" asChild>
        <a href={originalFileUrl} target="_blank" rel="noreferrer">
          <Download aria-hidden />
          Open original PowerPoint
        </a>
      </Button>
      <p className="text-xs text-muted-foreground">
        You can view the slides without installing PowerPoint. Some fonts or
        complex graphics may look slightly different from the original.
      </p>
    </section>
  );
}
