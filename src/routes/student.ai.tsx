import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/student/ai")({
  beforeLoad: () => {
    throw redirect({
      to: "/student",
    });
  },
});