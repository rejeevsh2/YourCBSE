import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminActivity } from "@/data/admin";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — YourCBSE Admin" },
      { name: "description", content: "Configure notification channels and review recent alerts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminNotificationsPage,
});

const channels = [
  { id: "approvals", label: "Content awaiting approval", hint: "Email + in-app", on: true },
  { id: "signups", label: "New teacher sign-ups", hint: "In-app only", on: true },
  { id: "security", label: "Security alerts", hint: "Email + SMS", on: true },
  { id: "storage", label: "Storage threshold reached", hint: "Email", on: true },
  { id: "digest", label: "Weekly platform digest", hint: "Email, Mondays 08:00", on: false },
  { id: "marketing", label: "Campaign performance", hint: "Email", on: false },
];

function AdminNotificationsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Notifications"
      description="Choose what the admin team is told about, and how."
      actions={<Button className="rounded-2xl">Save preferences</Button>}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Channels" icon={Bell}>
          <ul className="space-y-4">
            {channels.map((channel) => (
              <li key={channel.id} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={channel.id} className="text-sm font-medium">
                    {channel.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{channel.hint}</p>
                </div>
                <Switch id={channel.id} defaultChecked={channel.on} />
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Recent notifications" icon={Bell}>
          <ul className="space-y-3">
            {adminActivity.map((entry) => (
              <li key={entry.id} className="tile p-4 text-sm">
                <p>{entry.text}</p>
                <p className="text-xs text-muted-foreground">{entry.time}</p>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
