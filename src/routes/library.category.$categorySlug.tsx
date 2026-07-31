import { useMemo } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceGrid } from "@/components/resource-center/ResourceGrid";
import { NoSearchResults } from "@/components/resource-center/LibraryStates";
import { categoryBlurb, categoryFromSlug } from "@/components/resource-center/category-icons";
import { libraryResources } from "@/data/resource-center";
import { useResourceLibrary } from "@/hooks/use-resource-library";

export const Route = createFileRoute("/library/category/$categorySlug")({
  loader: ({ params }) => {
    const category = categoryFromSlug(params.categorySlug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    const label = loaderData?.category ?? "Resources";
    const title = `${label} for CBSE Classes 6–12 | YourCBSE`;
    const description = `Browse every ${label.toLowerCase()} in the YourCBSE library, filtered by grade, subject and chapter.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const library = useResourceLibrary();
  const resources = useMemo(
    () => libraryResources.filter((resource) => resource.category === category),
    [category],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Resource Center", to: "/library" },
          { label: category },
        ]}
        title={category}
        description={categoryBlurb(category)}
      />

      <p className="text-sm text-muted-foreground" role="status">
        {resources.length} resources in this category
      </p>

      <ResourceGrid
        label={`${category} resources`}
        resources={resources}
        library={library}
        emptyState={<NoSearchResults />}
      />
    </div>
  );
}
