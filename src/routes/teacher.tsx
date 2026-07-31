import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Portal — YourCBSE" },
      {
        name: "description",
        content: "Manage subjects, chapters, resources and student progress.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeacherLayoutRoute,
});

function TeacherLayoutRoute() {
  return (
    <PortalLayout portal="teacher">
      <Outlet />
    </PortalLayout>
  );
}
