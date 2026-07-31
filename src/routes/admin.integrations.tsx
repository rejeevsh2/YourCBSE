import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { adminIntegrations } from "@/data/admin";

export const Route = createFileRoute("/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — YourCBSE Admin" },
      { name: "description", content: "Connected services powering video, email, storage and analytics." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminIntegrationsPage,
});

function AdminIntegrationsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Integrations"
      description="External services connected to the platform."
    >
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminIntegrations.map((integration) => (
          <li key={integration.id} className="tile tile-interactive space-y-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Plug className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading truncate text-sm font-bold">{integration.name}</h3>
                <p className="text-xs text-muted-foreground">{integration.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TonedBadge
                label={integration.connected ? "Connected" : "Not connected"}
                tone={integration.connected ? "success" : "muted"}
                dot
              />
              <Button
                size="sm"
                variant={integration.connected ? "outline" : "default"}
                className="ml-auto rounded-2xl"
              >
                {integration.connected ? "Manage" : "Connect"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </PortalPage>
  );
}
