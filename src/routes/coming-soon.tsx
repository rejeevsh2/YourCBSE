import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/coming-soon")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
    });
  },
});