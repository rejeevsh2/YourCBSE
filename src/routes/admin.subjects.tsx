import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminSubjects } from "@/data/admin";

export const Route = createFileRoute("/admin/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — YourCBSE Admin" },
      { name: "description", content: "Manage subjects across every grade." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSubjectsPage,
});

function AdminSubjectsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Subjects"
      description="Subject catalogue, ownership and chapter coverage."
    >
      <ContentManager
        items={adminSubjects}
        caption="Subjects"
        createLabel="New subject"
        searchPlaceholder="Search subjects…"
      />
    </PortalPage>
  );
}
