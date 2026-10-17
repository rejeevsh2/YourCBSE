export type YouTubeVideoInfo = { id: string; startSeconds: number };

export const NATIVE_YOUTUBE_ORIGIN = "https://in.co.yourschool.app";

function parseStart(value: string | null): number {
  if (!value) return 0;
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i.exec(value);
  const seconds = /^\d+$/.test(value)
    ? Number(value)
    : match
      ? Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)
      : 0;
  return Number.isSafeInteger(seconds) && seconds <= 2_147_483_647 ? seconds : 0;
}

// Accept video URLs, never arbitrary hosts, playlists or HTML supplied in links.
export function parseYouTubeVideo(value: string): YouTubeVideoInfo | null {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port)
      return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (["youtu.be", "www.youtu.be"].includes(host)) {
      id = /^\/([\w-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
    } else if (
      ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)
    ) {
      id = /^\/watch\/?$/.test(url.pathname)
        ? url.searchParams.get("v")
        : (/^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/.exec(url.pathname)?.[1] ?? null);
    } else if (["youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      id = /^\/embed\/([\w-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
    }
    if (!id || !/^[\w-]{11}$/.test(id)) return null;
    const hash = new URLSearchParams(url.hash.slice(1));
    return {
      id,
      startSeconds: parseStart(
        url.searchParams.get("start") || url.searchParams.get("t") || hash.get("t"),
      ),
    };
  } catch {
    return null;
  }
}

export function youtubePlayerUrl(video: YouTubeVideoInfo, native: boolean): string {
  const url = new URL(
    native
      ? `${NATIVE_YOUTUBE_ORIGIN}/youtube-player.html`
      : `https://www.youtube.com/embed/${video.id}`,
  );
  if (native) url.searchParams.set("videoId", video.id);
  else url.searchParams.set("playsinline", "1");
  if (video.startSeconds) url.searchParams.set("start", String(video.startSeconds));
  return url.href;
}

export function youtubeWatchUrl(video: YouTubeVideoInfo): string {
  const url = new URL("https://www.youtube.com/watch");
  url.searchParams.set("v", video.id);
  if (video.startSeconds) url.searchParams.set("t", `${video.startSeconds}s`);
  return url.href;
}
