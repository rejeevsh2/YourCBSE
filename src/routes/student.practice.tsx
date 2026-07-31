import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { LaunchCard } from "@/components/student/LaunchCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { practiceHistory } from "@/data/student";
import { practiceCategories } from "@/data/student-library";

export const Route = createFileRoute("/student/practice")({
  head: () => ({
    meta: [
      { title: "Practice Centre — YourCBSE" },
      { name: "description", content: "MCQs, timed quizzes, mock exams and previous year papers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PracticeCentrePage,
});

type Attempt = (typeof practiceHistory)[number];

const columns: Column<Attempt>[] = [
  {
    key: "title",
    header: "Attempt",
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{row.title}</p>
        <p className="truncate text-xs text-muted-foreground">{row.type}</p>
      </div>
    ),
  },
  {
    key: "score",
    header: "Score",
    render: (row) => (
      <Badge variant="secondary" className="rounded-full">
        {row.score}
      </Badge>
    ),
  },
  {
    key: "accuracy",
    header: "Accuracy",
    render: (row) => (
      <div className="flex min-w-32 items-center gap-2">
        <Progress value={row.accuracy} aria-label={`${row.title} accuracy`} />
        <span className="shrink-0 text-xs font-semibold">{row.accuracy}%</span>
      </div>
    ),
  },
  {
    key: "date",
    header: "When",
    render: (row) => <span className="text-sm text-muted-foreground">{row.date}</span>,
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: () => (
      <Button size="sm" variant="outline" className="rounded-2xl">
        Review
      </Button>
    ),
  },
];

function PracticeCentrePage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Practice Center"
      description="Pick a format, set the pace, and see exactly where you stand."
    >
      <StatGrid
        items={[
          { label: "Questions solved", value: "1,286", hint: "+64 this week", tone: "success" },
          { label: "Average accuracy", value: "81%", hint: "+4%", tone: "success" },
          { label: "Tests attempted", value: "38", tone: "primary" },
          { label: "Daily challenge", value: "7-day run", hint: "Live now", tone: "warning" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {practiceCategories.map((tile) => (
          <LaunchCard key={tile.id} {...tile} />
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold">Recent attempts</h2>
        <DataTable columns={columns} rows={practiceHistory} caption="Recent practice attempts" />
      </section>
    </PortalPage>
  );
}
