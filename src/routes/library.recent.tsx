import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceGrid } from "@/components/resource-center/ResourceGrid";
import { NoRecentlyViewed } from "@/components/resource-center/LibraryStates";
import { resourceById } from "@/data/resource-center";
import { useResourceLibrary } from "@/hooks/use-resource-library";

const title = "Recently Viewed Resources | YourCBSE Resource Center";
const description =
  "Continue where you stopped — the CBSE lessons, videos, notes and papers you opened most recently.";

export const Route = createFileRoute("/library/recent")({
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
  component: RecentlyViewedPage,
});

function RecentlyViewedPage() {
  const library = useResourceLibrary();

  const resources = useMemo(
    () =>
      library.recentlyViewed
        .map((id) => resourceById.get(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [library.recentlyViewed],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Resource Center", to: "/library" },
          { label: "Recently viewed" },
        ]}
        title="Recently viewed"
        description="The last resources you opened, newest first."
      />

      <ResourceGrid
        label="Recently viewed resources"
        resources={resources}
        library={library}
        loading={library.loading}
        emptyState={<NoRecentlyViewed />}
      />
    </div>
  );
}
