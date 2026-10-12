import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ProfileForm } from "@/components/common/ProfileForm";

export const Route = createFileRoute("/teacher/profile")({
  head: () => ({
    meta: [
      { title: "Teacher Profile — YourSchool" },
      { name: "description", content: "Manage your teaching profile and subjects." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeacherProfilePage,
});

function TeacherProfilePage() {
  return (
    <PortalPage
      portalLabel="Teacher Portal"
      portalPath="/teacher"
      showNotice={false}
      title="Profile"
      description="Your public teaching profile and contact details."
    >
      <ProfileForm />
    </PortalPage>
  );
}
