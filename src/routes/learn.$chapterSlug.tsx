import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/learn/$chapterSlug")({
  beforeLoad: () => {
    throw redirect({
      to: "/grades",
    });
  },
});