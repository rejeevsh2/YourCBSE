import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { adminQuestionGroups, type AdminQuestionGroup } from "@/data/admin";

export const Route = createFileRoute("/admin/question-bank")({
  head: () => ({
    meta: [
      { title: "Question Bank — YourCBSE Admin" },
      { name: "description", content: "Manage question formats, coverage and review state." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminQuestionBankPage,
});

const columns: Column<AdminQuestionGroup>[] = [
  {
    key: "type",
    header: "Question type",
    render: (row) => <span className="text-sm font-semibold">{row.type}</span>,
  },
  {
    key: "count",
    header: "Questions",
    render: (row) => (
      <Badge variant="secondary" className="rounded-full">
        {row.count.toLocaleString()}
      </Badge>
    ),
  },
  {
    key: "chapters",
    header: "Chapters covered",
    render: (row) => <span className="text-sm text-muted-foreground">{row.chapters}</span>,
  },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  {
    key: "lastUpdated",
    header: "Updated",
    render: (row) => <span className="text-sm text-muted-foreground">{row.lastUpdated}</span>,
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (row) => (
      <RowActions
        label={row.type}
        actions={[
          { label: "Open bank" },
          { label: "Bulk import" },
          { label: "Export CSV" },
          { label: "Archive", separatorBefore: true, destructive: true },
        ]}
      />
    ),
  },
];

function AdminQuestionBankPage() {
  const total = adminQuestionGroups.reduce((sum, group) => sum + group.count, 0);

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Question Bank"
      description="Every question format across the curriculum, with coverage and review state."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total questions" value={total.toLocaleString()} hint="9 formats" tone="primary" />
        <StatCard label="Chapters covered" value="312" hint="94% coverage" tone="success" />
        <StatCard label="In review" value="1,340" hint="Needs approval" tone="warning" />
        <StatCard label="Archived" value="1,010" tone="destructive" />
      </div>

      <StudioToolbar
        searchPlaceholder="Search questions…"
        filters={[
          { id: "grade", label: "Grade", options: ["All grades", "Class 9", "Class 10", "Class 11", "Class 12"] },
          { id: "difficulty", label: "Difficulty", options: ["All levels", "Easy", "Moderate", "Challenging"] },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl">
              <Upload className="size-4" /> Bulk import
            </Button>
            <Button className="rounded-2xl">
              <Plus className="size-4" /> New question
            </Button>
          </div>
        }
      />

      <DataTable columns={columns} rows={adminQuestionGroups} caption="Question formats" />
    </PortalPage>
  );
}
