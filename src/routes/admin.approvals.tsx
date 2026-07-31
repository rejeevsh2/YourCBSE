import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, X } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { ApprovalBadge } from "@/components/admin/AdminBadges";
import { adminApprovals, type ApprovalItem } from "@/data/admin";

export const Route = createFileRoute("/admin/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — YourCBSE Admin" },
      { name: "description", content: "Review and approve submitted content before publication." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminApprovalsPage,
});

const columns: Column<ApprovalItem>[] = [
  {
    key: "title",
    header: "Submission",
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{row.title}</p>
        <p className="truncate text-xs text-muted-foreground">{row.kind}</p>
      </div>
    ),
  },
  {
    key: "submittedBy",
    header: "Submitted by",
    render: (row) => <span className="text-sm text-muted-foreground">{row.submittedBy}</span>,
  },
  {
    key: "submittedAt",
    header: "Submitted",
    render: (row) => <span className="text-sm text-muted-foreground">{row.submittedAt}</span>,
  },
  { key: "state", header: "State", render: (row) => <ApprovalBadge state={row.state} /> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (row) => (
      <div className="flex justify-end gap-1">
        <Button size="sm" variant="ghost" className="rounded-2xl" aria-label={`Preview ${row.title}`}>
          <Eye className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" className="rounded-2xl" aria-label={`Approve ${row.title}`}>
          <Check className="size-4 text-success" />
        </Button>
        <Button size="sm" variant="ghost" className="rounded-2xl" aria-label={`Reject ${row.title}`}>
          <X className="size-4 text-destructive" />
        </Button>
      </div>
    ),
  },
];

function AdminApprovalsPage() {
  const pending = adminApprovals.filter((item) => item.state === "Pending").length;

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Approvals"
      description="Everything waiting for an editorial decision before it goes live."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending" value={String(pending)} hint="Needs review" tone="warning" />
        <StatCard label="Approved this week" value="42" tone="success" />
        <StatCard label="Needs revision" value="6" tone="warning" />
        <StatCard label="Rejected" value="3" tone="destructive" />
      </div>

      <StudioToolbar
        searchPlaceholder="Search submissions…"
        filters={[
          { id: "kind", label: "Type", options: ["All types", "Chapter", "Interactive App", "Question Set", "Video", "Worksheet"] },
          { id: "state", label: "State", options: ["All states", "Pending", "Approved", "Needs revision", "Rejected"] },
        ]}
      />

      <DataTable columns={columns} rows={adminApprovals} caption="Approval queue" />
    </PortalPage>
  );
}
