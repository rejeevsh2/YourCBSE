import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import {
  NATIVE_YOUTUBE_ORIGIN,
  parseYouTubeVideo,
  youtubePlayerUrl,
  youtubeWatchUrl,
} from "../src/lib/youtube.ts";

const id = "M7lc1UVf-VE";

test("standard channel video, share, Shorts, live and embed links resolve to one video", () => {
  for (const url of [
    `https://www.youtube.com/watch?v=${id}&si=tracking`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://music.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=tracking`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/live/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
  ])
    assert.deepEqual(parseYouTubeVideo(url), { id, startSeconds: 0 }, url);
});

test("YouTube-looking hosts, credentials, invalid IDs, playlists and unsafe protocols are rejected", () => {
  for (const url of [
    `https://youtube.com.evil.test/watch?v=${id}`,
    `https://notyoutube.com/watch?v=${id}`,
    `https://youtube.com@evil.test/watch?v=${id}`,
    `https://user:password@youtube.com/watch?v=${id}`,
    `https://youtube.com:8443/watch?v=${id}`,
    `javascript:alert('${id}')`,
    `file:///watch?v=${id}`,
    `https://youtu.be/${id}/extra`,
    "https://youtube.com/watch?v=short",
    "https://youtube.com/watch?v=%22%3E%3Cscript%3E",
    "https://youtube.com/playlist?list=PL1234",
    "https://youtube.com/@YourSchool",
  ])
    assert.equal(parseYouTubeVideo(url), null, url);
});

test("valid shared timestamps survive while invalid and oversized starts are ignored", () => {
  for (const [suffix, expected] of [
    ["?t=95", 95],
    ["?t=1h2m3s", 3723],
    ["#t=2m", 120],
    ["?start=45", 45],
    ["?t=-3", 0],
    ["?t=Infinity", 0],
    ["?t=2147483648", 0],
  ]) {
    assert.equal(parseYouTubeVideo(`https://youtu.be/${id}${suffix}`).startSeconds, expected);
  }
});

test("native frame uses the app identity origin and exposes no tracking or original query data", () => {
  const video = parseYouTubeVideo(
    `https://youtube.com/watch?v=${id}&t=90&token=secret&origin=https://evil.test`,
  );
  const native = new URL(youtubePlayerUrl(video, true));
  assert.equal(native.origin, NATIVE_YOUTUBE_ORIGIN);
  assert.equal(native.pathname, "/youtube-player.html");
  assert.deepEqual(
    [...native.searchParams],
    [
      ["videoId", id],
      ["start", "90"],
    ],
  );
  assert.equal(
    youtubePlayerUrl(video, false),
    `https://www.youtube.com/embed/${id}?playsinline=1&start=90`,
  );
  assert.equal(youtubeWatchUrl(video), `https://www.youtube.com/watch?v=${id}&t=90s`);
});

function playerHarness(query = `?videoId=${id}&start=72`, legacyBridge = false) {
  const html = readFileSync(
    new URL("../android/app/src/main/assets/youtube-player.html", import.meta.url),
    "utf8",
  );
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
  const reports = [];
  const listeners = {};
  const elements = {};
  let options;
  let pauses = 0;
  let loader;
  const parent = { postMessage: (message, origin) => reports.push({ message, origin }) };
  const window = {
    addEventListener: (event, handler) => {
      listeners[event] = handler;
    },
  };
  if (legacyBridge) window.androidBridge = {};
  const document = {
    createElement: () => ({}),
    head: {
      appendChild: (element) => {
        loader = element;
      },
    },
    getElementById: (id) => (elements[id] ||= {}),
  };
  const YT = {
    Player: function (_element, configuration) {
      options = configuration;
      this.pauseVideo = () => {
        pauses++;
      };
    },
  };
  runInNewContext(script, {
    window,
    document,
    location: { search: query, origin: NATIVE_YOUTUBE_ORIGIN },
    URLSearchParams,
    parent,
    YT,
  });
  return {
    window,
    listeners,
    reports,
    parent,
    loader,
    options: () => options,
    pauses: () => pauses,
  };
}

test("the bundled wrapper identifies the app and keeps YouTube controls without autoplay", () => {
  const h = playerHarness();
  assert.equal(h.loader.src, "https://www.youtube.com/iframe_api");
  h.window.onYouTubeIframeAPIReady();
  const options = h.options();
  assert.equal(options.videoId, id);
  assert.equal(options.playerVars.origin, NATIVE_YOUTUBE_ORIGIN);
  assert.equal(options.playerVars.start, 72);
  assert.equal(options.playerVars.controls, 1);
  assert.equal(options.playerVars.fs, 1);
  assert.equal(options.playerVars.autoplay, 0);
  options.events.onReady();
  assert.equal(h.reports[0].origin, "https://localhost");
  assert.equal(h.reports[0].message.event, "ready");
});

test("embedding and network errors are reported, and successful playback can clear an error", () => {
  const h = playerHarness();
  h.window.onYouTubeIframeAPIReady();
  h.options().events.onError({ data: 150 });
  assert.equal(h.reports.at(-1).message.code, 150);
  h.options().events.onStateChange({ data: 1 });
  assert.equal(h.reports.at(-1).message.event, "playing");
  h.loader.onerror();
  assert.equal(h.reports.at(-1).message.code, 0);
});

test("only the signed-in app parent can request a pause, including before the player is ready", () => {
  const h = playerHarness();
  const pause = {
    origin: "https://localhost",
    source: h.parent,
    data: { type: "yourschool:pause" },
  };
  h.listeners.message(pause);
  h.window.onYouTubeIframeAPIReady();
  h.options().events.onReady();
  assert.equal(h.pauses(), 1);
  h.listeners.message({ ...pause, origin: "https://evil.test" });
  h.listeners.message({ ...pause, source: {} });
  assert.equal(h.pauses(), 1);
  h.listeners.message(pause);
  assert.equal(h.pauses(), 2);
});

test("the native HTML independently rejects malformed video IDs and invalid starts", () => {
  const invalid = playerHarness("?videoId=%3Cscript%3E");
  invalid.window.onYouTubeIframeAPIReady();
  assert.equal(invalid.options(), undefined);
  assert.equal(invalid.reports[0].message.code, 2);
  const h = playerHarness(`?videoId=${id}&start=-1`);
  h.window.onYouTubeIframeAPIReady();
  assert.equal(h.options().playerVars.start, 0);
});

test("legacy WebViews never load third-party scripts into a frame with a native bridge", () => {
  const h = playerHarness(`?videoId=${id}`, true);
  assert.equal(h.loader, undefined);
  assert.equal(h.reports[0].message.code, "webview");
});
