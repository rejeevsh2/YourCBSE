import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminGrades } from "@/data/admin";

export const Route = createFileRoute("/admin/grades")({
  head: () => ({
    meta: [
      { title: "Grades — YourCBSE Admin" },
      { name: "description", content: "Manage grade structure, coverage and publication state." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminGradesPage,
});

function AdminGradesPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Grades"
      description="Every CBSE grade, its coverage and publication state."
    >
      <ContentManager
        items={adminGrades}
        caption="Grades"
        createLabel="New grade"
        searchPlaceholder="Search grades…"
      />
    </PortalPage>
  );
}
