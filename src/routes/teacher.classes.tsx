import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/classes")({
  beforeLoad: () => {
    throw redirect({
      to: "/teacher",
    });
  },
});