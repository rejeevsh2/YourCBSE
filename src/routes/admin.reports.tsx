import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart, Plus } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { adminReports } from "@/data/admin";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — YourCBSE Admin" },
      { name: "description", content: "Scheduled and on-demand platform reports." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminReportsPage,
});

type ReportRow = (typeof adminReports)[number];

const columns: Column<ReportRow>[] = [
  {
    key: "name",
    header: "Report",
    render: (row) => (
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <FileBarChart className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{row.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.period}</p>
        </div>
      </div>
    ),
  },
  {
    key: "format",
    header: "Format",
    render: (row) => (
      <Badge variant="outline" className="rounded-full text-[11px]">
        {row.format}
      </Badge>
    ),
  },
  {
    key: "size",
    header: "Size",
    render: (row) => <span className="text-sm text-muted-foreground">{row.size}</span>,
  },
  {
    key: "generated",
    header: "Generated",
    render: (row) => <span className="text-sm text-muted-foreground">{row.generated}</span>,
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: () => (
      <Button size="sm" variant="outline" className="rounded-2xl">
        <Download className="size-4" /> Download
      </Button>
    ),
  },
];

function AdminReportsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Reports"
      description="Generated summaries of usage, engagement and content coverage."
      actions={
        <Button className="rounded-2xl">
          <Plus className="size-4" /> Generate report
        </Button>
      }
    >
      <DataTable columns={columns} rows={adminReports} caption="Available reports" />
    </PortalPage>
  );
}
