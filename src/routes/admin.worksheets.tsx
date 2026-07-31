import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminWorksheets } from "@/data/admin";

export const Route = createFileRoute("/admin/worksheets")({
  head: () => ({
    meta: [
      { title: "Worksheets — YourCBSE Admin" },
      { name: "description", content: "Manage printable worksheets and practice sheets." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminWorksheetsPage,
});

function AdminWorksheetsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Worksheets"
      description="Printable practice sheets with answer keys."
    >
      <ContentManager
        items={adminWorksheets}
        caption="Worksheets"
        createLabel="New worksheet"
        searchPlaceholder="Search worksheets…"
        showUpload
      />
    </PortalPage>
  );
}
