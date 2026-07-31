import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus, Send } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { Progress } from "@/components/ui/progress";
import { adminAnnouncements, adminCampaigns } from "@/data/admin";

export const Route = createFileRoute("/admin/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — YourCBSE Admin" },
      { name: "description", content: "Broadcast messages and campaigns to students and teachers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAnnouncementsPage,
});

function AdminAnnouncementsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Announcements"
      description="Platform-wide broadcasts, banners and email campaigns."
      actions={
        <Button className="rounded-2xl">
          <Plus className="size-4" /> New announcement
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Scheduled & live" icon={Megaphone}>
          <ul className="space-y-3">
            {adminAnnouncements.map((item) => (
              <li key={item.id} className="tile space-y-2 p-4">
                <div className="flex items-start gap-3">
                  <p className="min-w-0 flex-1 text-sm font-semibold">{item.title}</p>
                  <TonedBadge
                    label={item.status}
                    tone={
                      item.status === "Published"
                        ? "success"
                        : item.status === "Scheduled"
                          ? "primary"
                          : "warning"
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.audience} · {item.channel} · {item.date}
                </p>
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Email campaigns" icon={Send}>
          <ul className="space-y-4">
            {adminCampaigns.map((campaign) => (
              <li key={campaign.id} className="tile space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.channel} · {campaign.recipients} recipients · {campaign.status}
                    </p>
                  </div>
                  <TonedBadge label={`${campaign.opened} opened`} tone="primary" />
                </div>
                <Progress
                  value={Number.parseInt(campaign.opened, 10)}
                  aria-label={`${campaign.name} open rate`}
                />
              </li>
            ))}
          </ul>
        </StudioPanel>

      </div>
    </PortalPage>
  );
}
