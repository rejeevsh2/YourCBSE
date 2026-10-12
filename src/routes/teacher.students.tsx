import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/students")({
  beforeLoad: () => {
    throw redirect({
      to: "/teacher",
    });
  },
});