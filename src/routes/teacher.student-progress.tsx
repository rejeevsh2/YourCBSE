import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { DataTable, type Column } from "@/components/common/DataTable";
import { TablePagination } from "@/components/common/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/teacher/student-progress")({
  head: () => ({
    meta: [
      { title: "Student Progress — YourCBSE Teacher" },
      { name: "description", content: "See how your classes are progressing chapter by chapter." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentProgressPage,
});

interface StudentRow {
  id: string;
  name: string;
  grade: string;
  chapters: string;
  completion: number;
}

const rows: StudentRow[] = [
  { id: "st1", name: "Ananya Sharma", grade: "Class 10", chapters: "24 / 36", completion: 68 },
  { id: "st2", name: "Rohit Nair", grade: "Class 10", chapters: "30 / 36", completion: 83 },
  { id: "st3", name: "Fatima Khan", grade: "Class 9", chapters: "18 / 32", completion: 56 },
  { id: "st4", name: "Dev Patel", grade: "Class 9", chapters: "12 / 32", completion: 38 },
  { id: "st5", name: "Ishita Roy", grade: "Class 12", chapters: "28 / 34", completion: 82 },
];

const columns: Column<StudentRow>[] = [
  { key: "name", header: "Student", render: (row) => row.name },
  { key: "grade", header: "Grade", render: (row) => <Badge variant="secondary">{row.grade}</Badge> },
  { key: "chapters", header: "Chapters", render: (row) => row.chapters },
  {
    key: "completion",
    header: "Completion",
    render: (row) => (
      <div className="flex min-w-40 items-center gap-3">
        <Progress value={row.completion} className="w-28" />
        <span className="text-xs text-muted-foreground">{row.completion}%</span>
      </div>
    ),
  },
];

function StudentProgressPage() {
  return (
    <PortalPage
      portalLabel="Teacher Portal"
      portalPath="/teacher"
      title="Student Progress"
      description="Chapter completion for the students in your classes."
    >
      <DataTable columns={columns} rows={rows} caption="Student progress" />
      <TablePagination totalPages={6} />
    </PortalPage>
  );
}
