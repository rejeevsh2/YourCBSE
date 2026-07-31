import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ListToolbar } from "@/components/student/ListToolbar";
import { ResourceCard } from "@/components/student/ResourceCard";
import { Button } from "@/components/ui/button";
import { useFilteredList } from "@/hooks/use-filtered-list";
import { downloadIcons, downloadKinds, downloads, type DownloadItem } from "@/data/student";

export const Route = createFileRoute("/student/downloads")({
  head: () => ({
    meta: [
      { title: "Download Centre — YourCBSE" },
      { name: "description", content: "Offline PDFs, notes, worksheets, flash cards and mind maps." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DownloadCentre,
});

const searchOf = (item: DownloadItem) => item.title;
const kindOf = (item: DownloadItem) => item.kind;

function DownloadCentre() {
  const { query, setQuery, kind, setKind, results } = useFilteredList({
    items: downloads,
    search: searchOf,
    kindOf,
  });

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Download Centre"
      description="Your offline library — grouped by format and ready when the network isn't."
    >
      <StatGrid
        items={[
          { label: "Files stored", value: String(downloads.length), tone: "primary" },
          { label: "Storage used", value: "11.5 MB", hint: "of 500 MB", tone: "primary" },
          {
            label: "Added today",
            value: String(downloads.filter((item) => item.downloadedOn === "Today").length),
            tone: "success",
          },
          { label: "Available offline", value: "All", tone: "success" },
        ]}
      />

      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchLabel="Search downloads"
        searchPlaceholder="Search downloads"
        kinds={downloadKinds}
        activeKind={kind}
        onKindChange={setKind}
        filterLabel="Filter downloads by format"
        resultSummary={`${results.length} of ${downloads.length} files shown`}
      />

      {results.length === 0 ? (
        <EmptyState
          icon={<Download className="size-6" aria-hidden="true" />}
          title="Nothing here yet"
          description="Try another format or clear the search."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <ResourceCard
              key={item.id}
              icon={downloadIcons[item.kind]}
              title={item.title}
              meta={`${item.subject} · ${item.size}`}
              badge={item.kind}
              footnote={item.downloadedOn}
              action={
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 shrink-0 rounded-2xl"
                  aria-label={`Open ${item.title}`}
                >
                  <Download className="size-4" aria-hidden="true" />
                </Button>
              }
            />
          ))}
        </ul>
      )}
    </PortalPage>
  );
}
