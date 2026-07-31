import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminVideos } from "@/data/admin";

export const Route = createFileRoute("/admin/videos")({
  head: () => ({
    meta: [
      { title: "Videos — YourCBSE Admin" },
      { name: "description", content: "Manage the platform video library." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminVideosPage,
});

function AdminVideosPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Videos"
      description="Lesson videos, their source and publication state."
    >
      <ContentManager
        items={adminVideos}
        caption="Videos"
        createLabel="Add video"
        searchPlaceholder="Search videos…"
        showUpload
      />
    </PortalPage>
  );
}
