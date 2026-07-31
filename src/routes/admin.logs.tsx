import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { adminSystemLogs, type LogEntry } from "@/data/admin";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({
    meta: [
      { title: "System Logs — YourCBSE Admin" },
      { name: "description", content: "Application and infrastructure log stream." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogsPage,
});

const levelTone = { INFO: "primary", WARN: "warning", ERROR: "destructive" } as const;

const columns: Column<LogEntry>[] = [
  {
    key: "level",
    header: "Level",
    render: (row) => <TonedBadge label={row.level} tone={levelTone[row.level]} />,
  },
  {
    key: "source",
    header: "Source",
    render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.source}</span>,
  },
  {
    key: "message",
    header: "Message",
    render: (row) => <span className="text-sm">{row.message}</span>,
  },
  {
    key: "time",
    header: "Time",
    render: (row) => <span className="text-sm text-muted-foreground">{row.time}</span>,
  },
];

function AdminLogsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="System Logs"
      description="Live application and infrastructure events."
      actions={
        <Button variant="outline" className="rounded-2xl">
          <Download className="size-4" /> Export logs
        </Button>
      }
    >
      <StudioToolbar
        searchPlaceholder="Search log messages…"
        filters={[
          { id: "level", label: "Level", options: ["All levels", "INFO", "WARN", "ERROR"] },
          { id: "range", label: "Range", options: ["Last hour", "Last 24 hours", "Last 7 days"] },
        ]}
      />
      <DataTable columns={columns} rows={adminSystemLogs} caption="System log stream" />
    </PortalPage>
  );
}
