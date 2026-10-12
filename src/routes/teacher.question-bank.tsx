import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/question-bank")({
  beforeLoad: () => {
    throw redirect({
      to: "/teacher",
    });
  },
});