import assert from "node:assert/strict";
import test from "node:test";
import { localInteractiveAppPath } from "../src/lib/native/interactive-app-links.ts";

test("school launcher links stay in the Android app's signed-in context", () => {
  assert.equal(localInteractiveAppPath(new URL("https://yourschool.co.in/interactive-app/12")), "/interactive-app/12");
  assert.equal(localInteractiveAppPath(new URL("https://www.yourschool.co.in/interactive-app/12/")), "/interactive-app/12");
});

test("third-party links and invalid launcher paths are not rewritten", () => {
  for (const value of [
    "https://example.org/interactive-app/12",
    "https://yourschool.co.in.example.org/interactive-app/12",
    "http://yourschool.co.in/interactive-app/12",
    "https://person@yourschool.co.in/interactive-app/12",
    "https://yourschool.co.in/interactive-app/0",
    "https://yourschool.co.in/interactive-app/12/files/index.html",
    "https://yourschool.co.in/lesson/12",
  ]) {
    assert.equal(localInteractiveAppPath(new URL(value)), undefined, value);
  }
});

test("backend launch tickets remain browser URLs rather than local routes", () => {
  const url = new URL("https://api.yourschool.co.in/interactive-apps/12/open?ticket=example");
  assert.equal(localInteractiveAppPath(url), undefined);
  assert.equal(url.searchParams.get("ticket"), "example");
});
