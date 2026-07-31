import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ResourceManager } from "@/components/teacher/ResourceManager";

export const Route = createFileRoute("/teacher/videos")({
  head: () => ({
    meta: [
      { title: "Videos — Teacher Studio" },
      { name: "description", content: "Upload and manage video lessons." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VideosPage,
});

function VideosPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Videos"
      description="Video lessons mapped to chapters, with preview and replace controls."
      showNotice={false}
    >
      <ResourceManager kinds={["Video"]} uploadLabel="Videos" searchPlaceholder="Search videos…" />
    </PortalPage>
  );
}
