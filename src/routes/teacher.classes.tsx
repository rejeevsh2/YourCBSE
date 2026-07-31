import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Users } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { studioClasses } from "@/data/teacher";

export const Route = createFileRoute("/teacher/classes")({
  head: () => ({
    meta: [
      { title: "My Classes — Teacher Studio" },
      { name: "description", content: "Classes you teach and their syllabus progress." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="My classes"
      description="Six sections across Grades 8 to 12, with live syllabus coverage."
      showNotice={false}
    >
      <StudioToolbar
        searchPlaceholder="Search classes…"
        filters={[{ id: "subject", label: "Subject", options: ["Mathematics", "Science"] }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {studioClasses.map((item) => (
          <article key={item.id} className="tile tile-interactive flex h-full flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-heading text-base font-bold">{item.name}</h2>
                <p className="text-xs text-muted-foreground">{item.subject}</p>
              </div>
              <Badge variant="secondary" className="rounded-full text-[11px]">
                <Users className="mr-1 size-3" aria-hidden="true" /> {item.students}
              </Badge>
            </div>

            <Progress value={item.progress} aria-label={`${item.name} syllabus progress`} />
            <p className="text-xs text-muted-foreground">{item.progress}% syllabus covered</p>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" aria-hidden="true" /> Next session {item.nextSession}
            </p>

            <Button variant="outline" size="sm" className="mt-auto w-fit rounded-2xl">
              Open class
            </Button>
          </article>
        ))}
      </div>
    </PortalPage>
  );
}
