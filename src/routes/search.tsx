import { createFileRoute } from "@tanstack/react-router";

import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { LiveLibrary } from "@/components/resource-center/LiveLibrary";

type PublicSearchParams = {
  q?: string;
};

const title = "Search CBSE Learning Resources | YourSchool";
const description =
  "Search published CBSE notes, worksheets, videos and other learning resources available on YourSchool.";

export const Route = createFileRoute("/search")({
  validateSearch: (
    search: Record<string, unknown>,
  ): PublicSearchParams => ({
    q:
      typeof search.q === "string" &&
      search.q.trim().length > 0
        ? search.q.trim()
        : undefined,
  }),

  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),

  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();

  return (
    <PublicLayout>
      <PublicPageShell>
        <LiveLibrary
          mode="all"
          initialQuery={q ?? ""}
        />
      </PublicPageShell>
    </PublicLayout>
  );
}