import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { RowActions } from "@/components/teacher/RowActions";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { adminSupportTickets } from "@/data/admin";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      { title: "Support — YourCBSE Admin" },
      { name: "description", content: "Inbound support tickets from students and teachers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSupportPage,
});

type Ticket = (typeof adminSupportTickets)[number];

const columns: Column<Ticket>[] = [
  {
    key: "subject",
    header: "Ticket",
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{row.subject}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.id} · {row.requester}
        </p>
      </div>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    render: (row) => (
      <TonedBadge
        label={row.priority}
        tone={row.priority === "High" ? "destructive" : row.priority === "Medium" ? "warning" : "muted"}
      />
    ),
  },

  {
    key: "status",
    header: "Status",
    render: (row) => <span className="text-sm text-muted-foreground">{row.status}</span>,
  },
  {
    key: "updated",
    header: "Updated",
    render: (row) => <span className="text-sm text-muted-foreground">{row.updated}</span>,
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (row) => (
      <RowActions
        label={row.subject}
        actions={[
          { label: "Open ticket" },
          { label: "Assign to me" },
          { label: "Mark resolved" },
          { label: "Close", separatorBefore: true, destructive: true },
        ]}
      />
    ),
  },
];

function AdminSupportPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Support"
      description="Requests from learners, teachers and schools."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open tickets" value="18" tone="warning" />
        <StatCard label="First response" value="1h 12m" hint="Median" tone="success" />
        <StatCard label="Resolved this week" value="64" tone="success" />
        <StatCard label="Satisfaction" value="4.7 / 5" tone="primary" />
      </div>

      <StudioToolbar
        searchPlaceholder="Search tickets…"
        filters={[
          { id: "priority", label: "Priority", options: ["All priorities", "Urgent", "High", "Normal", "Low"] },
          { id: "status", label: "Status", options: ["All statuses", "Open", "In progress", "Waiting", "Resolved"] },
        ]}
      />

      <DataTable columns={columns} rows={adminSupportTickets} caption="Support tickets" />
    </PortalPage>
  );
}
