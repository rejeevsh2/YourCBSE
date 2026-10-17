import { useEffect, useState } from "react";
import { ExternalLink, FileText, Loader2, RefreshCw } from "lucide-react";
import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { PresentationSlides } from "@/components/lessons/PresentationSlides";
import { Button } from "@/components/ui/button";

/**
 * The API never sends a permanent object URL to the student. Each access is
 * authorized by Laravel (account status, class and lesson publication).
 */
export type PrivateLessonItem = {
  id: number;
  title: string;
  content_type: string;
  file_mime_type?: string | null;
  external_url?: string | null;
};

async function getSignedUrl(id: number): Promise<string> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/lesson-attachments/${id}/temporary-url`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? "You no longer have access to this file."
        : "This private file is not available. Please try again.",
    );
  }

  const payload: { url?: unknown } = await response.json();
  if (typeof payload.url !== "string" || !payload.url.startsWith("https://")) {
    throw new Error("The file link could not be created securely.");
  }

  return payload.url;
}

/** For student/teacher previews: fetch on demand, not while listing lessons. */
export function PrivateLessonAttachment({ item }: { item: PrivateLessonItem }) {
  // Render slide images instead of handing the original PPTX to student browsers.
  // The presentation component preserves legacy behavior until Phase 3 is enabled.
  return item.content_type === "ppt" ? (
    <PresentationSlides id={item.id} title={item.title} />
  ) : (
    <StandardPrivateLessonAttachment item={item} />
  );
}

function StandardPrivateLessonAttachment({ item }: { item: PrivateLessonItem }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUrl(null);
    setError("");
  }, [item.id]);

  async function load() {
    if (loading) return;
    setLoading(true);
    setUrl(null);
    setError("");

    try {
      setUrl(await getSignedUrl(item.id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not open file.");
    } finally {
      setLoading(false);
    }
  }

  const kind = item.content_type;
  const mime = item.file_mime_type ?? "";
  const pdf = kind === "pdf" || mime === "application/pdf";
  const image = kind === "image" || mime.startsWith("image/");
  const audio = kind === "audio" || mime.startsWith("audio/");
  const video = kind === "video" || mime.startsWith("video/");

  return (
    <div className="space-y-3">
      {!url ? (
        <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {loading ? "Checking access..." : "View private file"}
        </Button>
      ) : (
        <>
          {pdf && import.meta.env.VITE_NATIVE_APP !== "true" ? (
            <iframe src={url} title={item.title} className="h-[680px] w-full rounded-xl border" referrerPolicy="no-referrer" />
          ) : image ? (
            <img src={url} alt={item.title} className="max-h-[650px] w-full rounded-xl border object-contain" referrerPolicy="no-referrer" />
          ) : audio ? (
            <audio src={url} controls className="w-full" />
          ) : video ? (
            <video src={url} controls playsInline className="aspect-video w-full rounded-xl" />
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                <ExternalLink className="size-4" />
                Open file
              </a>
            </Button>
            <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
              Refresh access
            </Button>
          </div>
        </>
      )}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {item.external_url ? (
        <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm underline">
          <ExternalLink className="size-4" /> Open external resource
        </a>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Private file access expires shortly. Select Refresh access if playback or viewing stops.
      </p>
    </div>
  );
}

/** Direct launch from admin tables or resource menus; no persistent URL storage. */
export async function openPrivateAttachmentInNewTab(id: number): Promise<void> {
  if (import.meta.env.VITE_NATIVE_APP === "true") {
    const { openExternalResource } = await import("@/lib/native/resources");
    await openExternalResource(await getSignedUrl(id));
    return;
  }
  const tab = window.open("about:blank", "_blank");
  if (tab) tab.opener = null;

  try {
    const url = await getSignedUrl(id);
    if (tab && !tab.closed) {
      tab.location.replace(url);
    } else {
      // If a browser blocks the popup, avoid silently navigating away.
      throw new Error("Please allow popups for YourSchool to open this private file.");
    }
  } catch (error) {
    if (tab && !tab.closed) tab.close();
    throw error;
  }
}

/** For the admin content table: open a blank tab synchronously to avoid popup blockers. */
export function PrivateLessonOpenAction({ id, title }: { id: number; title: string }) {
  const [loading, setLoading] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function open() {
    if (loading) return;
    // Reserve a popup on the website; Android opens its browser after authorization.
    const native = import.meta.env.VITE_NATIVE_APP === "true";
    const tab = native ? null : window.open("about:blank", "_blank");
    if (tab) tab.opener = null;

    setLoading(true);
    setFallbackUrl(null);
    setError("");
    try {
      const link = await getSignedUrl(id);
      if (native) {
        const { openExternalResource } = await import("@/lib/native/resources");
        await openExternalResource(link);
      } else if (tab && !tab.closed) {
        tab.location.replace(link);
      } else {
        setFallbackUrl(link);
      }
    } catch (error) {
      if (tab && !tab.closed) tab.close();
      setError(error instanceof Error ? error.message : "Could not open file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => void open()}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
        {loading ? "Opening..." : title}
      </Button>
      {fallbackUrl ? (
        <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="text-xs underline">
          Open signed link
        </a>
      ) : null}
      {error ? <span role="alert" className="text-xs text-destructive">{error}</span> : null}
    </span>
  );
}
