import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ProfileForm } from "@/components/common/ProfileForm";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile — YourTeacher" },
      { name: "description", content: "Manage your student profile details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentProfilePage,
});

function StudentProfilePage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      showNotice={false}
      title="Profile"
      description="Your personal details and study preferences."
    >
      <ProfileForm />
    </PortalPage>
  );
}
