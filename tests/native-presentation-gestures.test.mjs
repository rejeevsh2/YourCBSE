import assert from "node:assert/strict";
import test from "node:test";
import { PresentationGestures, fitSlide, clampSlide } from "../src/lib/native/presentation-gestures.ts";

const bounds = { width: 800, height: 450, imageWidth: 1600, imageHeight: 900 };
function viewer() {
  const gestures = new PresentationGestures();
  gestures.setBounds(bounds);
  return gestures;
}

test("slides use all available image space without cropping in either orientation", () => {
  assert.deepEqual(fitSlide({ ...bounds, width: 1440, height: 720 }), { width: 1280, height: 720 });
  assert.deepEqual(fitSlide({ ...bounds, width: 360, height: 800 }), { width: 360, height: 202.5 });
});

test("one-finger horizontal swipes change slides at normal zoom", () => {
  const g = viewer();
  g.down(1, { x: 500, y: 225 }, 0);
  assert.equal(g.up(1, { x: 250, y: 240 }, 250), "next");
  g.down(1, { x: 250, y: 225 }, 400);
  assert.equal(g.up(1, { x: 500, y: 230 }, 650), "previous");
});

test("vertical, diagonal, short and slow drags do not change slides", () => {
  for (const [point, time] of [[{ x: 420, y: 400 }, 200], [{ x: 600, y: 400 }, 200], [{ x: 430, y: 230 }, 200], [{ x: 650, y: 225 }, 1000]]) {
    const g = viewer();
    g.down(1, { x: 400, y: 225 }, 0);
    assert.equal(g.up(1, point, time), undefined);
  }
});

test("pinching enlarges the slide around the fingers and never triggers a swipe", () => {
  const g = viewer();
  g.down(1, { x: 300, y: 225 }, 0);
  g.down(2, { x: 500, y: 225 }, 10);
  g.move(1, { x: 200, y: 225 });
  g.move(2, { x: 600, y: 225 });
  assert.deepEqual(g.value, { scale: 2, x: 0, y: 0 });
  assert.equal(g.up(1, { x: 200, y: 225 }, 100), undefined);
  assert.equal(g.up(2, { x: 750, y: 225 }, 200), undefined);
});

test("one finger pans a zoomed slide instead of navigating", () => {
  const g = viewer();
  g.zoom(2);
  g.down(1, { x: 500, y: 225 }, 0);
  g.move(1, { x: 200, y: 150 });
  assert.deepEqual(g.value, { scale: 2, x: -300, y: -75 });
  assert.equal(g.up(1, { x: 200, y: 150 }, 200), undefined);
});

test("pinching back down restores the whole slide and resets pan", () => {
  const g = viewer();
  g.zoom(3, { x: 300, y: 200 });
  g.down(1, { x: 100, y: 225 }, 0);
  g.down(2, { x: 700, y: 225 }, 10);
  g.move(1, { x: 390, y: 225 });
  g.move(2, { x: 410, y: 225 });
  assert.deepEqual(g.value, { scale: 1, x: 0, y: 0 });
});

test("zoom is anchored to the tapped position and capped at five times", () => {
  const g = viewer();
  g.zoom(2.5, { x: 350, y: 200 });
  assert.deepEqual(g.value, { scale: 2.5, x: 75, y: 37.5 });
  g.zoom(50);
  assert.equal(g.value.scale, 5);
  g.zoom(0);
  assert.deepEqual(g.value, { scale: 1, x: 0, y: 0 });
});

test("pan bounds prevent losing the slide beyond its edges", () => {
  assert.deepEqual(clampSlide({ scale: 5, x: 9999, y: -9999 }, bounds), { scale: 5, x: 1600, y: -900 });
  assert.deepEqual(clampSlide({ scale: 1, x: 300, y: 300 }, bounds), { scale: 1, x: 0, y: 0 });
  const g = viewer();
  g.zoom(2);
  g.setBounds({ ...bounds, width: 360, height: 800 });
  assert.equal(g.value.y, 0, "short slides remain centered vertically in portrait");
});

test("cancelled gestures and an extra finger cannot change the slide", () => {
  const g = viewer();
  g.down(1, { x: 700, y: 225 }, 0);
  g.cancel();
  assert.equal(g.up(1, { x: 100, y: 225 }, 100), undefined);
  g.down(1, { x: 300, y: 225 }, 200);
  g.down(2, { x: 500, y: 225 }, 210);
  g.down(3, { x: 600, y: 225 }, 220);
  assert.equal(g.pointerCount, 2);
  assert.equal(g.up(3, { x: 0, y: 225 }, 250), undefined);
  assert.deepEqual(g.value, { scale: 1, x: 0, y: 0 });
  g.reset();
  assert.equal(g.pointerCount, 0);
});
