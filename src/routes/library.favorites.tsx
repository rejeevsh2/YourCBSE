import { createFileRoute } from "@tanstack/react-router";
import { LiveLibrary } from "@/components/resource-center/LiveLibrary";
export const Route = createFileRoute("/library/favorites")({
  component: () => <LiveLibrary mode="saved" />,
});
