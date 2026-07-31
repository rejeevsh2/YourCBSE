import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { RowActions } from "@/components/teacher/RowActions";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { studioStudents } from "@/data/teacher";

export const Route = createFileRoute("/teacher/students")({
  head: () => ({
    meta: [
      { title: "Students — Teacher Studio" },
      { name: "description", content: "Track student progress across your classes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentsPage,
});

type Row = (typeof studioStudents)[number];

const flagTone: Record<string, string> = {
  Ahead: "border-success/30 bg-success/12 text-success",
  "On track": "border-primary/30 bg-primary/12 text-primary",
  "Needs help": "border-destructive/30 bg-destructive/12 text-destructive",
};

const columns: Column<Row>[] = [
  { key: "name", header: "Student", render: (row) => <span className="font-semibold">{row.name}</span> },
  { key: "classroom", header: "Class", render: (row) => row.classroom },
  {
    key: "progress",
    header: "Progress",
    render: (row) => (
      <div className="flex min-w-[8rem] items-center gap-2">
        <Progress value={row.progress} className="h-2" aria-label={`${row.name} progress`} />
        <span className="text-xs text-muted-foreground">{row.progress}%</span>
      </div>
    ),
  },
  {
    key: "flag",
    header: "Status",
    render: (row) => (
      <Badge variant="outline" className={`rounded-full text-[11px] ${flagTone[row.flag]}`}>
        {row.flag}
      </Badge>
    ),
  },
  { key: "lastActive", header: "Last active", render: (row) => <span className="text-sm text-muted-foreground">{row.lastActive}</span> },
  {
    key: "actions",
    header: "Actions",
    className: "text-right",
    render: (row) => (
      <div className="flex justify-end">
        <RowActions
          label={row.name}
          actions={[{ label: "View profile" }, { label: "Send message" }, { label: "Assign practice" }]}
        />
      </div>
    ),
  },
];

function StudentsPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Students"
      description="Progress signals across all of your classes."
      showNotice={false}
    >
      <StudioToolbar
        searchPlaceholder="Search students…"
        filters={[
          { id: "class", label: "Class", options: ["Class 9 — A", "Class 10 — A", "Class 12 — A"] },
          { id: "status", label: "Status", options: ["Ahead", "On track", "Needs help"] },
        ]}
      />
      <DataTable columns={columns} rows={studioStudents} caption="Students" />
    </PortalPage>
  );
}
