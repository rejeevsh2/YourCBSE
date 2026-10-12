import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/player/$chapterSlug")({
  beforeLoad: () => {
    throw redirect({
      to: "/grades",
    });
  },
});