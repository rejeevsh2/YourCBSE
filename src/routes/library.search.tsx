import { createFileRoute } from "@tanstack/react-router";
import { LiveLibrary } from "@/components/resource-center/LiveLibrary";
export const Route = createFileRoute("/library/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: Search,
});
function Search() {
  const { q } = Route.useSearch();
  return <LiveLibrary initialQuery={q} />;
}
