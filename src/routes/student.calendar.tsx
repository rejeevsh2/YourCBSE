import { createFileRoute } from "@tanstack/react-router";
import { LivePlanner } from "@/components/student/LivePlanner";
export const Route = createFileRoute("/student/calendar")({
  component: () => <LivePlanner calendar={true} />,
});
