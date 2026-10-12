import { createFileRoute } from "@tanstack/react-router";
import { LiveLibrary } from "@/components/resource-center/LiveLibrary";
export const Route = createFileRoute("/library/")({ component: () => <LiveLibrary mode="all" /> });
