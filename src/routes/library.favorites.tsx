import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceGrid } from "@/components/resource-center/ResourceGrid";
import { NoFavorites } from "@/components/resource-center/LibraryStates";
import { ListToolbar } from "@/components/student/ListToolbar";
import { resourceById, resourceCategories } from "@/data/resource-center";
import { useFilteredList } from "@/hooks/use-filtered-list";
import { useResourceLibrary } from "@/hooks/use-resource-library";

const title = "Favourites — Saved CBSE Resources | YourCBSE";
const description =
  "Every lesson, video, note, worksheet, flash-card deck and mind map you bookmarked, in one place.";

export const Route = createFileRoute("/library/favorites")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const library = useResourceLibrary();

  const favourites = useMemo(
    () =>
      library.bookmarks
        .map((id) => resourceById.get(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [library.bookmarks],
  );

  const { query, setQuery, kind, setKind, results } = useFilteredList({
    items: favourites,
    kindOf: (item) => item.category,
    search: (item) => `${item.title} ${item.subject} ${item.chapter}`,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Resource Center", to: "/library" },
          { label: "Favourites" },
        ]}
        title="Favourites"
        description="Bookmarked lessons, videos, notes, worksheets, flash cards, mind maps and interactive lessons."
      />

      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchLabel="Search favourites"
        searchPlaceholder="Search favourites"
        kinds={resourceCategories}
        activeKind={kind}
        onKindChange={setKind}
        filterLabel="Filter favourites by type"
        resultSummary={`${results.length} of ${favourites.length} saved resources`}
      />


      <ResourceGrid
        label="Favourite resources"
        resources={results}
        library={library}
        loading={library.loading}
        emptyState={<NoFavorites />}
      />
    </div>
  );
}
