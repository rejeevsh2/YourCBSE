import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminChapters } from "@/data/admin";

export const Route = createFileRoute("/admin/chapters")({
  head: () => ({
    meta: [
      { title: "Chapters — YourCBSE Admin" },
      { name: "description", content: "Manage chapters, versions and publication state." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminChaptersPage,
});

function AdminChaptersPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Chapters"
      description="Chapter library with authorship, versioning and publishing controls."
    >
      <ContentManager
        items={adminChapters}
        caption="Chapters"
        createLabel="New chapter"
        searchPlaceholder="Search chapters…"
      />
    </PortalPage>
  );
}
