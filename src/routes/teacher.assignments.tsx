import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { studioAssignments } from "@/data/teacher";

export const Route = createFileRoute("/teacher/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments — Teacher Studio" },
      { name: "description", content: "Create and track class assignments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssignmentsPage,
});

type Row = (typeof studioAssignments)[number];

const columns: Column<Row>[] = [
  { key: "title", header: "Assignment", render: (row) => <span className="font-semibold">{row.title}</span> },
  { key: "classroom", header: "Class", render: (row) => row.classroom },
  { key: "due", header: "Due", render: (row) => <span className="text-sm text-muted-foreground">{row.due}</span> },
  {
    key: "submitted",
    header: "Submissions",
    render: (row) => (
      <div className="flex min-w-[8rem] items-center gap-2">
        <Progress
          value={(row.submitted / row.total) * 100}
          className="h-2"
          aria-label={`${row.title} submissions`}
        />
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {row.submitted}/{row.total}
        </span>
      </div>
    ),
  },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  {
    key: "actions",
    header: "Actions",
    className: "text-right",
    render: (row) => (
      <div className="flex justify-end">
        <RowActions
          label={row.title}
          actions={[{ label: "Edit" }, { label: "Grade submissions" }, { label: "Close", destructive: true, separatorBefore: true }]}
        />
      </div>
    ),
  },
];

function AssignmentsPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Assignments"
      description="Set work, track submissions and grade from one table."
      showNotice={false}
      actions={
        <Button className="rounded-2xl">
          <Plus className="size-4" /> New assignment
        </Button>
      }
    >
      <StudioToolbar
        searchPlaceholder="Search assignments…"
        filters={[
          { id: "class", label: "Class", options: ["Class 9 — A", "Class 10 — A", "Class 10 — B"] },
          { id: "status", label: "Status", options: ["Published", "Draft", "In review"] },
        ]}
      />
      <DataTable columns={columns} rows={studioAssignments} caption="Assignments" />
    </PortalPage>
  );
}
