import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Reveal } from "@/components/common/Reveal";
import { Button } from "@/components/ui/button";
import { CategoryGrid } from "@/components/resource-center/CategoryGrid";
import { ResourceRail } from "@/components/resource-center/ResourceRail";
import { ResourceGridSkeleton } from "@/components/resource-center/ResourceSkeletons";
import {
  libraryResources,
  recommendationRails,
  resourceById,
  resourcesForRail,
} from "@/data/resource-center";
import { useResourceLibrary } from "@/hooks/use-resource-library";

const title = "Resource Center — Notes, Videos & Practice | YourCBSE";
const description =
  "Browse every CBSE study resource in one library: interactive lessons, videos, notes, worksheets, question banks, mind maps, sample papers and mock tests.";

export const Route = createFileRoute("/library/")({
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
  component: LibraryHome,
});

function LibraryHome() {
  const library = useResourceLibrary();
  const recentlyViewed = library.recentlyViewed
    .map((id) => resourceById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="space-y-10">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Resource Center" }]}
        title="Resource Center"
        description={`One library for all ${libraryResources.length} CBSE resources — search, filter, save offline and pick up where you left off.`}
        actions={
          <Button asChild className="rounded-2xl">
            <Link to="/library/search">
              <Search className="size-4" aria-hidden="true" />
              Search the library
            </Link>
          </Button>
        }
      />

      <Reveal>
        <section aria-label="Categories" className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">Browse by category</h2>
          <CategoryGrid />
        </section>
      </Reveal>

      {library.loading ? (
        <ResourceGridSkeleton count={3} />
      ) : (
        <ResourceRail
          title="Recently viewed"
          blurb="Jump straight back into your last few resources."
          resources={recentlyViewed}
          library={library}
          action={
            <Button asChild variant="ghost" className="rounded-2xl">
              <Link to="/library/recent">View all</Link>
            </Button>
          }
        />
      )}

      {recommendationRails.map((rail) => (
        <ResourceRail
          key={rail.id}
          title={rail.title}
          blurb={rail.blurb}
          resources={resourcesForRail(rail.id).slice(0, 6)}
          library={library}
        />
      ))}
    </div>
  );
}
