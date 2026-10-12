import { createFileRoute } from "@tanstack/react-router";

import { LiveLibrary } from "@/components/resource-center/LiveLibrary";

type StudentSearchParams = {
  q?: string;
  view?: "saved" | "recent";
};

export const Route = createFileRoute("/student/search")({
  validateSearch: (
    search: Record<string, unknown>,
  ): StudentSearchParams => {
    const view =
      search.view === "saved" ||
      search.view === "recent"
        ? search.view
        : undefined;

    return {
      q:
        typeof search.q === "string"
          ? search.q
          : undefined,
      view,
    };
  },

  component: StudentSearchPage,
});

function StudentSearchPage() {
  const search = Route.useSearch();

  const mode =
    search.view === "saved"
      ? "saved"
      : search.view === "recent"
        ? "recent"
        : "all";

  return (
    <LiveLibrary
      portal="student"
      mode={mode}
      initialQuery={search.q ?? ""}
    />
  );
}