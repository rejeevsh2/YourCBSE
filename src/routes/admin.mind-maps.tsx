import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminMindMaps } from "@/data/admin";

export const Route = createFileRoute("/admin/mind-maps")({
  head: () => ({
    meta: [
      { title: "Mind Maps — YourCBSE Admin" },
      { name: "description", content: "Manage concept maps and visual summaries." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminMindMapsPage,
});

function AdminMindMapsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Mind Maps"
      description="Concept maps and visual chapter summaries."
    >
      <ContentManager
        items={adminMindMaps}
        caption="Mind maps"
        createLabel="New mind map"
        searchPlaceholder="Search mind maps…"
      />
    </PortalPage>
  );
}
