import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Portal — YourCBSE" },
      {
        name: "description",
        content: "Your CBSE learning dashboard: progress, bookmarks, downloads and more.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentLayoutRoute,
});

function StudentLayoutRoute() {
  return (
    <PortalLayout portal="student">
      <Outlet />
    </PortalLayout>
  );
}
