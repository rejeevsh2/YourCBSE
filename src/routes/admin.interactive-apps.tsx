import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminApps } from "@/data/admin";

export const Route = createFileRoute("/admin/interactive-apps")({
  head: () => ({
    meta: [
      { title: "Interactive Apps — YourCBSE Admin" },
      { name: "description", content: "Manage interactive learning apps and their builds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAppsPage,
});

function AdminAppsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Interactive Apps"
      description="Simulations and interactive builds shipped with chapters."
    >
      <ContentManager
        items={adminApps}
        caption="Interactive apps"
        createLabel="New app"
        searchPlaceholder="Search apps…"
        showUpload
      />
    </PortalPage>
  );
}
