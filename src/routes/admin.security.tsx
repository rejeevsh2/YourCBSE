import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldAlert } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DataTable, type Column } from "@/components/common/DataTable";
import { adminLoginHistory, adminSecurityAlerts, type LoginEntry } from "@/data/admin";

export const Route = createFileRoute("/admin/security")({
  head: () => ({
    meta: [
      { title: "Security — YourCBSE Admin" },
      { name: "description", content: "Access policies, alerts and login history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSecurityPage,
});

const severityTone = { High: "destructive", Medium: "warning", Low: "muted" } as const;

const loginColumns: Column<LoginEntry>[] = [
  {
    key: "user",
    header: "Account",
    render: (row) => <span className="text-sm font-medium">{row.user}</span>,
  },
  {
    key: "device",
    header: "Device",
    render: (row) => <span className="text-sm text-muted-foreground">{row.device}</span>,
  },
  {
    key: "location",
    header: "Location",
    render: (row) => <span className="text-sm text-muted-foreground">{row.location}</span>,
  },
  {
    key: "status",
    header: "Result",
    render: (row) => (
      <TonedBadge label={row.status} tone={row.status === "Success" ? "success" : "destructive"} />
    ),
  },
  {
    key: "time",
    header: "When",
    render: (row) => <span className="text-sm text-muted-foreground">{row.time}</span>,
  },
];

const policies = [
  { id: "mfa", label: "Require MFA for admin accounts", hint: "Recommended", on: true },
  { id: "rotate", label: "Force password rotation every 180 days", hint: "Applies to staff", on: true },
  { id: "lockout", label: "Lock account after 5 failed attempts", hint: "24-hour lockout", on: true },
  { id: "ip", label: "Restrict admin access by IP range", hint: "Not configured", on: false },
];

function AdminSecurityPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Security"
      description="Access policies, active alerts and recent authentication events."
      actions={<Button className="rounded-2xl">Save policies</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open alerts" value="3" tone="warning" />
        <StatCard label="Failed logins (24h)" value="19" tone="destructive" />
        <StatCard label="MFA adoption" value="86%" tone="success" />
        <StatCard label="Blocked IPs" value="4" tone="primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Active alerts" icon={ShieldAlert}>
          <ul className="space-y-3">
            {adminSecurityAlerts.map((alert) => (
              <li key={alert.id} className="tile space-y-2 p-4">
                <div className="flex items-start gap-3">
                  <p className="min-w-0 flex-1 text-sm font-semibold">{alert.title}</p>
                  <TonedBadge
                    label={alert.severity}
                    tone={severityTone[alert.severity as keyof typeof severityTone]}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.detail} · {alert.time}
                </p>
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Access policies" icon={KeyRound}>
          <ul className="space-y-4">
            {policies.map((policy) => (
              <li key={policy.id} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={policy.id} className="text-sm font-medium">
                    {policy.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{policy.hint}</p>
                </div>
                <Switch id={policy.id} defaultChecked={policy.on} />
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>

      <DataTable columns={loginColumns} rows={adminLoginHistory} caption="Recent logins" />
    </PortalPage>
  );
}
