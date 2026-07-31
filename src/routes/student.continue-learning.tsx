import { createFileRoute } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { featuredChapters } from "@/data/placeholder";

export const Route = createFileRoute("/student/continue-learning")({
  head: () => ({
    meta: [
      { title: "Continue Learning — YourCBSE" },
      { name: "description", content: "Resume your in-progress CBSE chapters." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContinueLearningPage,
});

function ContinueLearningPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Continue Learning"
      description="Chapters you have started but not yet finished."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {featuredChapters.map((chapter, index) => (
          <Card key={chapter.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold">{chapter.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {chapter.grade} · {chapter.subject}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <PlayCircle className="size-4" /> Resume
                </Button>
              </div>
              <Progress value={[80, 62, 48, 35, 22, 10][index] ?? 40} />
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalPage>
  );
}
