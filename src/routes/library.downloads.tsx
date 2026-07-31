import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Reveal } from "@/components/common/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResourceThumbnail } from "@/components/resource-center/ResourceThumbnail";
import { NoDownloads } from "@/components/resource-center/LibraryStates";
import { ResourceGridSkeleton } from "@/components/resource-center/ResourceSkeletons";
import { resourceById } from "@/data/resource-center";
import { useResourceLibrary } from "@/hooks/use-resource-library";

const title = "Download Centre — Offline CBSE Resources | YourCBSE";
const description =
  "Manage everything you saved offline: file type, size, download date, plus open, delete and re-download actions.";

export const Route = createFileRoute("/library/downloads")({
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
  component: DownloadCenterPage,
});

function DownloadCenterPage() {
  const library = useResourceLibrary();

  const items = useMemo(
    () =>
      library.downloads
        .map((entry) => {
          const resource = resourceById.get(entry.resourceId);
          return resource ? { ...entry, resource } : null;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [library.downloads],
  );

  const totalMb = items.reduce((total, item) => total + item.resource.fileSizeMb, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Resource Center", to: "/library" },
          { label: "Download centre" },
        ]}
        title="Download centre"
        description="Your offline shelf — available whenever the connection isn't."
        actions={
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/library/search">Find more resources</Link>
          </Button>
        }
      />

      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {items.length} file{items.length === 1 ? "" : "s"} · {totalMb.toFixed(1)} MB stored
      </p>

      {library.loading ? (
        <ResourceGridSkeleton count={3} row />
      ) : items.length ? (
        <ul className="grid gap-3" aria-label="Downloaded resources">
          {items.map((item, index) => (
            <Reveal as="li" key={item.resourceId} delay={Math.min(index, 8) * 40}>
              <article className="tile flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <ResourceThumbnail
                  category={item.resource.category}
                  label={item.resource.title}
                  size="sm"
                />
                <div className="flex-1 space-y-1">
                  <h2 className="font-heading text-sm font-bold text-foreground">
                    {item.resource.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {item.resource.grade} · {item.resource.subject} · {item.resource.chapter}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="rounded-full">
                      {item.resource.fileType}
                    </Badge>
                    <span>{item.resource.fileSizeMb} MB</span>
                    <span>Downloaded {item.downloadedAt}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" className="rounded-2xl">
                    <Link
                      to="/library/resource/$resourceId"
                      params={{ resourceId: item.resourceId }}
                    >
                      Open
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => library.download(item.resourceId)}
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Download again
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${item.resource.title} from downloads`}
                    className="min-h-9 min-w-9 rounded-2xl text-destructive"
                    onClick={() => library.removeDownload(item.resourceId)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      ) : (
        <NoDownloads />
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Download className="size-3.5" aria-hidden="true" />
        Downloads are stored on this device only.
      </p>
    </div>
  );
}
