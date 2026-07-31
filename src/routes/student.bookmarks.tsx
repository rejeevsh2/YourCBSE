import { createFileRoute } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ListToolbar } from "@/components/student/ListToolbar";
import { ResourceCard } from "@/components/student/ResourceCard";
import { useFilteredList } from "@/hooks/use-filtered-list";
import { bookmarkIcons, bookmarkKinds, bookmarks, type BookmarkItem } from "@/data/student";

export const Route = createFileRoute("/student/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmark Centre — YourCBSE" },
      { name: "description", content: "Every saved video, note, question and deck, organised by type." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookmarkCentre,
});

const searchOf = (item: BookmarkItem) => item.title;
const kindOf = (item: BookmarkItem) => item.kind;

function BookmarkCentre() {
  const { query, setQuery, kind, setKind, results } = useFilteredList({
    items: bookmarks,
    search: searchOf,
    kindOf,
  });

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Bookmark Centre"
      description="Everything you've saved, grouped by type so you can find it in seconds."
    >
      <StatGrid
        items={[
          { label: "Total saved", value: String(bookmarks.length), tone: "primary" },
          {
            label: "Videos",
            value: String(bookmarks.filter((item) => item.kind === "Video").length),
            tone: "primary",
          },
          {
            label: "Notes",
            value: String(bookmarks.filter((item) => item.kind === "Notes").length),
            tone: "success",
          },
          {
            label: "Saved today",
            value: String(bookmarks.filter((item) => item.savedOn === "Today").length),
            tone: "warning",
          },
        ]}
      />

      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchLabel="Search bookmarks"
        searchPlaceholder="Search bookmarks"
        kinds={bookmarkKinds}
        activeKind={kind}
        onKindChange={setKind}
        filterLabel="Filter bookmarks by type"
        resultSummary={`${results.length} of ${bookmarks.length} bookmarks shown`}
      />

      {results.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="size-6" aria-hidden="true" />}
          title="No bookmarks match that filter"
          description="Try another type or clear the search."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <ResourceCard
              key={item.id}
              icon={bookmarkIcons[item.kind]}
              title={item.title}
              meta={`${item.subject} · ${item.meta}`}
              badge={item.kind}
              footnote={`Saved ${item.savedOn}`}
            />
          ))}
        </ul>
      )}
    </PortalPage>
  );
}
