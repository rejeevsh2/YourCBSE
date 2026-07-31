import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminNotes } from "@/data/admin";

export const Route = createFileRoute("/admin/notes")({
  head: () => ({
    meta: [
      { title: "Notes — YourCBSE Admin" },
      { name: "description", content: "Manage revision notes across grades and subjects." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminNotesPage,
});

function AdminNotesPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Notes"
      description="Revision notes and formula sheets published to learners."
    >
      <ContentManager
        items={adminNotes}
        caption="Notes"
        createLabel="New note"
        searchPlaceholder="Search notes…"
        showUpload
      />
    </PortalPage>
  );
}
