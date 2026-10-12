import { createFileRoute } from "@tanstack/react-router";

import { ProfileForm } from "@/components/common/ProfileForm";
import { PortalPage } from "@/components/layout/PortalPage";

export const Route = createFileRoute("/teacher/settings")({
  component: TeacherSettingsPage,
});

function TeacherSettingsPage() {
  return (
    <PortalPage
      portalLabel="Teacher"
      portalPath="/teacher"
      title="Settings"
      description="Manage your account profile and password."
      showNotice={false}
    >
      <ProfileForm />
    </PortalPage>
  );
}