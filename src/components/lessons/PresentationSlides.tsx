import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, FileDown, Loader2, Minimize2, RefreshCw } from "lucide-react";
import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { Button } from "@/components/ui/button";

type Slide = { number: number; url: string };
type SlideResponse = {
  status: "ready" | "processing";
  count?: number;
  slides?: Slide[];
  message?: string;
};

export function PresentationSlides({ id, title }: { id: number; title: string }) {
  const [mode, setMode] = useState<"idle" | "loading" | "ready" | "processing" | "legacy" | "error">("idle");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [originalLoading, setOriginalLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode("idle");
    setIndex(0);
    setSlides([]);
    setError("");
  }, [id]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === container.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  async function loadSlides() {
    setMode("loading");
    setError("");

    try {
      const result = await authenticatedFetch(
        API_BASE_URL + "/lesson-attachments/" + id + "/slides",
        { cache: "no-store", headers: { Accept: "application/json" } },
      );

      // The preview feature is intentionally OFF until the converter is ready.
      // Preserve existing presentation access during that deployment stage.
      if (result.status === 404) {
        setMode("legacy");
        return;
      }

      if (!result.ok) {
        throw new Error(result.status === 401 || result.status === 403
          ? "You do not have access to this presentation."
          : "Could not load the presentation. Please try again.");
      }

      const data = (await result.json()) as SlideResponse;
      if (data.status === "processing") {
        setMode("processing");
        return;
      }

      if (data.status !== "ready" || !Array.isArray(data.slides) || !data.slides.length ||
          data.slides.some((slide) => !slide.url.startsWith("https://"))) {
        throw new Error("The slide preview was incomplete.");
      }

      setSlides(data.slides);
      setIndex((old) => Math.min(old, data.slides!.length - 1));
      setMode("ready");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not open slides.");
      setMode("error");
    }
  }

  async function openOriginal() {
    if (originalLoading) return;
    const native = import.meta.env.VITE_NATIVE_APP === "true";
    const tab = native ? null : window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    setOriginalLoading(true);
    try {
      const result = await authenticatedFetch(
        API_BASE_URL + "/lesson-attachments/" + id + "/temporary-url",
        { cache: "no-store", headers: { Accept: "application/json" } },
      );
      if (!result.ok) throw new Error("Could not open the original presentation.");
      const data = (await result.json()) as { url?: string };
      if (!data.url?.startsWith("https://")) throw new Error("Invalid private link.");
      if (native) {
        const { openExternalResource } = await import("@/lib/native/resources");
        await openExternalResource(data.url);
      } else if (tab && !tab.closed) tab.location.replace(data.url);
      else throw new Error("Allow popups for YourSchool to open this file.");
    } catch (reason) {
      if (tab && !tab.closed) tab.close();
      setError(reason instanceof Error ? reason.message : "Cannot open presentation.");
    } finally {
      setOriginalLoading(false);
    }
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement === container.current) {
      await document.exitFullscreen?.();
      return;
    }

    await container.current?.requestFullscreen?.();
  }

  return (
    <section className="space-y-3" aria-label={"Presentation: " + title}>
      {mode === "idle" ? (
        <Button variant="outline" type="button" onClick={() => void loadSlides()}>
          View presentation slides
        </Button>
      ) : null}

      {mode === "loading" ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Preparing secure slides...
        </p>
      ) : null}

      {mode === "processing" ? (
        <div className="space-y-2 rounded-xl border p-4">
          <p className="text-sm">Your presentation slides are being prepared. Please try again shortly.</p>
          <Button variant="outline" type="button" onClick={() => void loadSlides()}>
            <RefreshCw className="size-4" /> Check again
          </Button>
        </div>
      ) : null}

      {mode === "legacy" ? (
        <div className="space-y-2 rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Inline slides are not yet enabled for this presentation. The original opens in a compatible app or downloads.
          </p>
          <Button variant="outline" type="button" disabled={originalLoading} onClick={() => void openOriginal()}>
            <FileDown className="size-4" /> Open PowerPoint
          </Button>
        </div>
      ) : null}

      {mode === "ready" && slides.length ? (
        <div
          ref={container}
          className="space-y-3 rounded-xl border bg-background p-2 sm:p-4"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setIndex((old) => Math.max(0, old - 1));
            if (event.key === "ArrowRight") setIndex((old) => Math.min(slides.length - 1, old + 1));
          }}
        >
          <div className="flex min-h-48 items-center justify-center bg-black/5">
            <img
              className="aspect-video max-h-[78vh] w-full object-contain"
              src={slides[index].url}
              alt={"Slide " + (index + 1) + " of " + slides.length + " — " + title}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="button" variant="outline" disabled={index === 0} onClick={() => setIndex((old) => Math.max(0, old - 1))}>
              <ArrowLeft className="size-4" /> Previous
            </Button>
            <span className="text-sm font-medium" aria-live="polite">
              Slide {index + 1} of {slides.length}
            </span>
            <Button type="button" variant="outline" disabled={index === slides.length - 1} onClick={() => setIndex((old) => Math.min(slides.length - 1, old + 1))}>
              Next <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void loadSlides()}>
              <RefreshCw className="size-4" /> Refresh access
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => void toggleFullscreen()}>
              {isFullscreen ? <Minimize2 className="size-4" /> : <Expand className="size-4" />}
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Slide links expire for your security. Use Refresh access if an image stops loading.
          </p>
        </div>
      ) : null}

      {mode === "error" ? (
        <Button variant="outline" type="button" onClick={() => void loadSlides()}>
          <RefreshCw className="size-4" /> Retry slides
        </Button>
      ) : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
