import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ResourceManager } from "@/components/teacher/ResourceManager";

export const Route = createFileRoute("/teacher/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Teacher Studio" },
      { name: "description", content: "Upload and manage chapter notes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Notes"
      description="PDF notes and formula sheets attached to your chapters."
      showNotice={false}
    >
      <ResourceManager kinds={["PDF Notes"]} uploadLabel="Notes" searchPlaceholder="Search notes…" />
    </PortalPage>
  );
}
