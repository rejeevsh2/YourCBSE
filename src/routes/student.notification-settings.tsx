import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { NotificationSettingsPanel } from "@/components/notifications/NotificationSettingsPanel";
import { NotificationSkeleton } from "@/components/notifications/NotificationStates";
import { useNotificationCenter } from "@/hooks/use-notification-center";

export const Route = createFileRoute("/student/notification-settings")({
  head: () => ({
    meta: [
      { title: "Notification Settings — YourTeacher" },
      {
        name: "description",
        content: "Choose which study reminders, achievements and alerts reach you, and how.",
      },
      { property: "og:title", content: "Notification Settings — YourTeacher" },
      {
        property: "og:description",
        content: "Control in-app lesson updates and announcements.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationSettingsPage,
});

function NotificationSettingsPage() {
  const center = useNotificationCenter();

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      showNotice={false}
      title="Notification Settings"
      description="Choose which in-app lesson updates and announcements you receive."
      actions={
        <Button asChild variant="outline" className="rounded-2xl">
          <Link to="/student/notification-center">
            <ArrowLeft className="size-4" /> Notification Center
          </Link>
        </Button>
      }
    >
      {center.loading ? (
        <NotificationSkeleton rows={3} />
      ) : (
        <NotificationSettingsPanel
          preferences={center.preferences}
          onToggle={(id, enabled) => void center.togglePreference(id, enabled)}
        />
      )}
    </PortalPage>
  );
}
