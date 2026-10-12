import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/messages")({
  beforeLoad: () => {
    throw redirect({
      to: "/teacher",
    });
  },
});