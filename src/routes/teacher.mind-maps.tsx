import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ResourceManager } from "@/components/teacher/ResourceManager";

export const Route = createFileRoute("/teacher/mind-maps")({
  head: () => ({
    meta: [
      { title: "Mind Maps — Teacher Studio" },
      { name: "description", content: "Upload and manage chapter mind maps." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MindMapsPage,
});

function MindMapsPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Mind maps"
      description="Visual concept maps that summarise a full chapter at a glance."
      showNotice={false}
    >
      <ResourceManager kinds={["Mind Map"]} uploadLabel="Mind maps" searchPlaceholder="Search mind maps…" />
    </PortalPage>
  );
}
