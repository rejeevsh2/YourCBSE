import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { adminAuditLogs, type AuditEntry } from "@/data/admin";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs — YourCBSE Admin" },
      { name: "description", content: "Who changed what, and when, across the platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAuditPage,
});

const columns: Column<AuditEntry>[] = [
  {
    key: "actor",
    header: "Actor",
    render: (row) => <span className="text-sm font-medium">{row.actor}</span>,
  },
  {
    key: "action",
    header: "Action",
    render: (row) => <span className="text-sm">{row.action}</span>,
  },
  {
    key: "target",
    header: "Target",
    render: (row) => <span className="text-sm text-muted-foreground">{row.target}</span>,
  },
  {
    key: "time",
    header: "When",
    render: (row) => <span className="text-sm text-muted-foreground">{row.time}</span>,
  },
];

function AdminAuditPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Audit Logs"
      description="An immutable trail of every administrative action."
      actions={
        <Button variant="outline" className="rounded-2xl">
          <Download className="size-4" /> Export trail
        </Button>
      }
    >
      <StudioToolbar
        searchPlaceholder="Search audit trail…"
        filters={[
          { id: "actor", label: "Actor", options: ["All actors", "Super Admin", "Admin", "Teacher"] },
          { id: "range", label: "Range", options: ["Last 24 hours", "Last 7 days", "Last 30 days"] },
        ]}
      />
      <DataTable columns={columns} rows={adminAuditLogs} caption="Audit trail" />
    </PortalPage>
  );
}
