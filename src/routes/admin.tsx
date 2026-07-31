import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — YourCBSE" },
      { name: "description", content: "Manage users, content, analytics and website settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  return (
    <PortalLayout portal="admin">
      <Outlet />
    </PortalLayout>
  );
}
