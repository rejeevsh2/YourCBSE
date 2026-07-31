import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, CalendarDays, Clock, Download, Gauge, Languages, User } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResourceActions } from "@/components/resource-center/ResourceActions";
import { ResourceGrid } from "@/components/resource-center/ResourceGrid";
import { ResourceThumbnail } from "@/components/resource-center/ResourceThumbnail";
import { ResourceDetailSkeleton } from "@/components/resource-center/ResourceSkeletons";
import { SearchFailed } from "@/components/resource-center/LibraryStates";
import {
  difficultyTone,
  recommendedResources,
  relatedResources,
  statusTone,
  type LibraryResource,
} from "@/data/resource-center";
import { resourceCenterService } from "@/lib/resource-center";
import { useResourceLibrary } from "@/hooks/use-resource-library";
import { cn } from "@/lib/utils";

const title = "Resource details | YourCBSE Resource Center";
const description =
  "Preview a CBSE resource with its chapter, author, difficulty, downloads and related material before you open or save it offline.";

export const Route = createFileRoute("/library/resource/$resourceId")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourceDetailPage,
});

function ResourceDetailPage() {
  const { resourceId } = Route.useParams();
  const library = useResourceLibrary();
  const [resource, setResource] = useState<LibraryResource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void resourceCenterService.getResource(resourceId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setResource(result.data);
        library.recordView(result.data.id);
      } else {
        setError(result.message);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  if (loading) return <ResourceDetailSkeleton />;
  if (error || !resource) return <SearchFailed message={error ?? undefined} />;

  const facts = [
    { icon: User, label: "Author", value: resource.author },
    { icon: CalendarDays, label: "Last updated", value: resource.updatedAt },
    { icon: Clock, label: "Estimated time", value: `${resource.durationMinutes} min` },
    { icon: Languages, label: "Language", value: resource.language },
    { icon: Download, label: "Downloads", value: resource.downloads.toLocaleString() },
    { icon: Bookmark, label: "Bookmarks", value: resource.bookmarks.toLocaleString() },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Resource Center", to: "/library" },
          { label: resource.category },
          { label: resource.title },
        ]}
        title={resource.title}
        description={resource.description}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <ResourceThumbnail category={resource.category} label={resource.title} size="lg" />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {resource.category}
            </Badge>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", difficultyTone[resource.difficulty])}>
              <Gauge className="mr-1 inline size-3.5" aria-hidden="true" />
              {resource.difficulty}
            </span>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusTone[resource.status])}>
              {resource.status}
            </span>
          </div>

          <ResourceActions
            variant="full"
            resourceId={resource.id}
            title={resource.title}
            bookmarked={library.bookmarks.includes(resource.id)}
            downloaded={library.downloads.some((item) => item.resourceId === resource.id)}
            onBookmark={library.toggleBookmark}
            onDownload={library.download}
            onShare={library.share}
          />

          <section className="tile space-y-2 p-5" aria-label="About this resource">
            <h2 className="font-heading text-base font-bold text-foreground">About this resource</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
            <p className="text-sm text-muted-foreground">
              File: {resource.fileType} · {resource.fileSizeMb} MB
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="tile space-y-3 p-5" aria-label="Resource details">
            <h2 className="font-heading text-base font-bold text-foreground">Details</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Grade</dt>
                <dd className="font-medium text-foreground">{resource.grade}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Subject</dt>
                <dd className="font-medium text-foreground">{resource.subject}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Chapter</dt>
                <dd className="text-right font-medium text-foreground">{resource.chapter}</dd>
              </div>
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <fact.icon className="size-3.5" aria-hidden="true" />
                    {fact.label}
                  </dt>
                  <dd className="text-right font-medium text-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <Button asChild variant="outline" className="w-full rounded-2xl">
              <Link to="/library/search" search={{ q: resource.chapter }}>
                More from this chapter
              </Link>
            </Button>
          </section>
        </aside>
      </div>

      <section className="space-y-3" aria-label="Related resources">
        <h2 className="font-heading text-lg font-bold text-foreground">Related resources</h2>
        <ResourceGrid
          label="Related resources"
          resources={relatedResources(resource)}
          library={library}
          emptyState={null}
        />
      </section>

      <section className="space-y-3" aria-label="Recommended for you">
        <h2 className="font-heading text-lg font-bold text-foreground">Recommended for you</h2>
        <ResourceGrid
          label="Recommended resources"
          resources={recommendedResources(resource)}
          library={library}
          emptyState={null}
        />
      </section>
    </div>
  );
}
