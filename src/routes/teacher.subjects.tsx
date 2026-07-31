import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { subjects } from "@/data/placeholder";

export const Route = createFileRoute("/teacher/subjects")({
  head: () => ({
    meta: [
      { title: "My Subjects — YourCBSE Teacher" },
      { name: "description", content: "Subjects assigned to you across grades." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeacherSubjectsPage,
});

function TeacherSubjectsPage() {
  return (
    <PortalPage
      portalLabel="Teacher Portal"
      portalPath="/teacher"
      title="My Subjects"
      description="Subjects you teach and publish material for."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.slice(0, 4).map((subject) => (
          <Card key={subject.id}>
            <CardContent className="flex items-start gap-3 p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <BookOpen className="size-5" />
              </span>
              <div className="space-y-1.5">
                <h2 className="font-heading font-semibold">{subject.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {subject.chapterCount} chapters
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {subject.grades.map((grade) => (
                    <Badge key={grade} variant="outline">
                      {grade}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalPage>
  );
}
