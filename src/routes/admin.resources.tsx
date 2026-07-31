import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { StatCard } from "@/components/common/StatCard";
import {
  adminFlashcards,
  adminMindMaps,
  adminNotes,
  adminVideos,
  adminWorksheets,
} from "@/data/admin";

export const Route = createFileRoute("/admin/resources")({
  head: () => ({
    meta: [
      { title: "Resource Library — YourCBSE Admin" },
      { name: "description", content: "Every learning resource across formats in one library." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminResourcesPage,
});

const allResources = [
  ...adminVideos,
  ...adminNotes,
  ...adminWorksheets,
  ...adminFlashcards,
  ...adminMindMaps,
];

function AdminResourcesPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Resource Library"
      description="Videos, notes, worksheets, flashcards and mind maps in a single catalogue."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total resources" value="3,412" hint="+96 this week" tone="success" />
        <StatCard label="Videos" value="912" tone="primary" />
        <StatCard label="Documents" value="1,684" tone="primary" />
        <StatCard label="Awaiting review" value="38" hint="Needs action" tone="warning" />
      </div>

      <ContentManager
        items={allResources}
        caption="All resources"
        createLabel="Add resource"
        searchPlaceholder="Search all resources…"
        showUpload
        filters={[
          { id: "type", label: "Type", options: ["All types", "Video", "Notes", "Worksheet", "Flashcards", "Mind Map"] },
          { id: "status", label: "Status", options: ["All statuses", "Published", "Draft", "In review", "Archived"] },
        ]}
      />
    </PortalPage>
  );
}
