import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studioGrades } from "@/data/teacher";

export const Route = createFileRoute("/teacher/grades")({
  head: () => ({
    meta: [
      { title: "Grades — Teacher Studio" },
      { name: "description", content: "Grade-level curriculum coverage." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GradesPage,
});

function GradesPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Grades"
      description="Curriculum coverage across every grade you contribute to."
      showNotice={false}
    >
      <StudioToolbar searchPlaceholder="Search grades…" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {studioGrades.map((grade) => (
          <article key={grade.id} className="tile tile-interactive space-y-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-base font-bold">{grade.name}</h2>
              <Badge variant="secondary" className="rounded-full text-[11px]">
                {grade.subjects} subjects
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-accent/40 p-3">
                <dt className="text-xs text-muted-foreground">Chapters</dt>
                <dd className="font-heading text-lg font-bold">{grade.chapters}</dd>
              </div>
              <div className="rounded-2xl bg-accent/40 p-3">
                <dt className="text-xs text-muted-foreground">My students</dt>
                <dd className="font-heading text-lg font-bold">{grade.students || "—"}</dd>
              </div>
            </dl>
            <Button variant="outline" size="sm" className="rounded-2xl">
              View chapters
            </Button>
          </article>
        ))}
      </div>
    </PortalPage>
  );
}
