import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { UserTable } from "@/components/admin/UserTable";
import { adminUsers } from "@/data/admin";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — YourCBSE Admin" },
      { name: "description", content: "Manage every account on the platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="User Management"
      description="Every student, teacher, parent and admin account in one place."
    >
      <UserTable rows={adminUsers} caption="All accounts" />
    </PortalPage>
  );
}
