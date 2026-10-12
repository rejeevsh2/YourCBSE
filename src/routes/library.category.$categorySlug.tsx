import { createFileRoute } from "@tanstack/react-router";
import { LiveLibrary } from "@/components/resource-center/LiveLibrary";
export const Route = createFileRoute("/library/category/$categorySlug")({ component: Category });
function Category() {
  const { categorySlug } = Route.useParams();
  const types: Record<string, string> = {
    videos: "video",
    "pdf-notes": "pdf",
    worksheets: "worksheet",
    "interactive-lessons": "activity",
  };
  return <LiveLibrary initialType={types[categorySlug] ?? categorySlug} />;
}
