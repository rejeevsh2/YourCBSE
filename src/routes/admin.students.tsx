import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { UserTable } from "@/components/admin/UserTable";
import { adminStudents } from "@/data/admin";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — YourCBSE Admin" },
      { name: "description", content: "Student accounts, enrolment and activity." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminStudentsPage,
});

function AdminStudentsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Students"
      description="Enrolled learners, their grade and account health."
    >
      <UserTable rows={adminStudents} caption="Student accounts" createLabel="Add student" />
    </PortalPage>
  );
}
