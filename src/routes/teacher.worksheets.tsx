import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ResourceManager } from "@/components/teacher/ResourceManager";

export const Route = createFileRoute("/teacher/worksheets")({
  head: () => ({
    meta: [
      { title: "Worksheets — Teacher Studio" },
      { name: "description", content: "Upload and manage printable worksheets." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WorksheetsPage,
});

function WorksheetsPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Worksheets"
      description="Printable and editable practice sheets per chapter."
      showNotice={false}
    >
      <ResourceManager kinds={["Worksheet"]} uploadLabel="Worksheets" searchPlaceholder="Search worksheets…" />
    </PortalPage>
  );
}
