import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/student/assistant")({
  beforeLoad: () => {
    throw redirect({
      to: "/student/ai",
    });
  },
});