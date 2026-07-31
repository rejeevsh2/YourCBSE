import { createFileRoute } from "@tanstack/react-router";
import { DatabaseBackup, Download, RefreshCw } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { adminBackups } from "@/data/admin";

export const Route = createFileRoute("/admin/backup")({
  head: () => ({
    meta: [
      { title: "Backup & Restore — YourCBSE Admin" },
      { name: "description", content: "Database and media snapshots, schedules and restore points." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminBackupPage,
});

type Backup = (typeof adminBackups)[number];

const columns: Column<Backup>[] = [
  {
    key: "name",
    header: "Snapshot",
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{row.name}</p>
        <p className="text-xs text-muted-foreground">{row.type}</p>
      </div>
    ),
  },
  {
    key: "size",
    header: "Size",
    render: (row) => <span className="text-sm text-muted-foreground">{row.size}</span>,
  },
  {
    key: "createdAt",
    header: "Created",
    render: (row) => <span className="text-sm text-muted-foreground">{row.createdAt}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <TonedBadge label={row.status} tone={row.status === "Complete" ? "success" : "destructive"} />
    ),
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (row) => (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" className="rounded-2xl" aria-label={`Download ${row.name}`}>
          <Download className="size-4" />
        </Button>
        <Button size="sm" variant="outline" className="rounded-2xl">
          Restore
        </Button>
      </div>
    ),
  },
];

function AdminBackupPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Backup & Restore"
      description="Automated snapshots of the database and media bucket."
      actions={
        <Button className="rounded-2xl">
          <RefreshCw className="size-4" /> Run backup now
        </Button>
      }
    >
      <StudioPanel title="Schedule" icon={DatabaseBackup}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="tile p-4">
            <p className="text-xs text-muted-foreground">Database</p>
            <p className="font-heading text-sm font-bold">Daily · 02:00 IST</p>
          </div>
          <div className="tile p-4">
            <p className="text-xs text-muted-foreground">Media bucket</p>
            <p className="font-heading text-sm font-bold">Weekly · Sunday 02:00</p>
          </div>
          <div className="tile p-4">
            <p className="text-xs text-muted-foreground">Retention</p>
            <p className="font-heading text-sm font-bold">30 days</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="min-w-0 flex-1">
            <Label htmlFor="auto-backup" className="text-sm font-medium">
              Automated backups
            </Label>
            <p className="text-xs text-muted-foreground">Disable only during planned maintenance.</p>
          </div>
          <Switch id="auto-backup" defaultChecked />
        </div>
      </StudioPanel>

      <DataTable columns={columns} rows={adminBackups} caption="Restore points" />
    </PortalPage>
  );
}
