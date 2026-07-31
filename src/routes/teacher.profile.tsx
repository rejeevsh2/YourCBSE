import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ProfileForm } from "@/components/common/ProfileForm";

export const Route = createFileRoute("/teacher/profile")({
  head: () => ({
    meta: [
      { title: "Teacher Profile — YourCBSE" },
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
      title="Profile"
      description="Your public teaching profile and contact details."
    >
      <ProfileForm
        name="Meera Iyer"
        role="Science Teacher · Classes 9–12"
        email="meera@yourcbse.com"
        bioLabel="Teaching bio"
      />
    </PortalPage>
  );
}
