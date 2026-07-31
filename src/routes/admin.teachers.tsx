import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { UserTable } from "@/components/admin/UserTable";
import { adminTeachers } from "@/data/admin";

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({
    meta: [
      { title: "Teachers — YourCBSE Admin" },
      { name: "description", content: "Review teacher accounts, approvals and activity." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTeachersPage,
});

function AdminTeachersPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Teachers"
      description="Teaching staff, onboarding status and subject ownership."
    >
      <UserTable rows={adminTeachers} caption="Teacher accounts" createLabel="Invite teacher" />
    </PortalPage>
  );
}
