import { useEffect, useRef, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NATIVE_YOUTUBE_ORIGIN,
  youtubePlayerUrl,
  youtubeWatchUrl,
  type YouTubeVideoInfo,
} from "@/lib/youtube";

export function YouTubeVideo({ video, title }: { video: YouTubeVideoInfo; title: string }) {
  const native = import.meta.env.VITE_NATIVE_APP === "true";
  const frame = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const src = youtubePlayerUrl(video, native);

  useEffect(() => {
    if (!native) return;
    let timer = window.setTimeout(() => {
      setStatus("error");
      setMessage(
        "The video is taking longer to load. Check your connection, then retry or open it in YouTube.",
      );
    }, 25_000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== NATIVE_YOUTUBE_ORIGIN || event.source !== frame.current?.contentWindow)
        return;
      if (event.data?.type !== "yourschool:youtube") return;
      window.clearTimeout(timer);
      timer = 0;
      if (event.data.event === "ready" || event.data.event === "playing") {
        setStatus("ready");
        setMessage("");
      } else if (event.data.event === "error") {
        setStatus("error");
        const code = event.data.code;
        setMessage(
          code === 101 || code === 150
            ? "This video cannot play here. Use Open in YouTube."
            : code === 100
              ? "This video is unavailable or private."
              : code === "webview"
                ? "Update Android System WebView to play here, or use Open in YouTube."
                : "The video could not load. Retry or open it in YouTube.",
        );
      }
    };
    const pause = () =>
      frame.current?.contentWindow?.postMessage(
        { type: "yourschool:pause" },
        NATIVE_YOUTUBE_ORIGIN,
      );
    const visibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("message", receive);
    window.addEventListener("yourschool:pause-videos", pause);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.clearTimeout(timer);
      pause();
      window.removeEventListener("message", receive);
      window.removeEventListener("yourschool:pause-videos", pause);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [native, src, attempt]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border bg-black">
        <iframe
          key={`${src}:${attempt}`}
          ref={frame}
          src={src}
          title={title}
          className="aspect-video min-h-[200px] w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      {native && status === "loading" ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading video…
        </p>
      ) : null}
      {native && status === "error" ? (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {native && status === "error" ? (
          <Button
            variant="outline"
            onClick={() => {
              setStatus("loading");
              setMessage("");
              setAttempt((value) => value + 1);
            }}
          >
            <RefreshCw className="size-4" /> Retry video
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <a href={youtubeWatchUrl(video)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" /> Open in YouTube
          </a>
        </Button>
      </div>
    </div>
  );
}
