import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { subjects } from "@/data/placeholder";

export const Route = createFileRoute("/student/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — YourCBSE" },
      { name: "description", content: "Track chapter completion across your subjects." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="My Progress"
      description="Chapter completion across every subject you follow."
    >
      <StatGrid
        items={[
          { label: "Overall completion", value: "68%", hint: "On track", tone: "success" },
          { label: "Chapters done", value: "24 / 36", tone: "primary" },
          { label: "Streak", value: "9 days", hint: "Keep going", tone: "warning" },
          { label: "Avg. quiz score", value: "82%", tone: "success" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Subject-wise progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {subjects.slice(0, 6).map((subject, index) => {
            const value = [86, 72, 64, 55, 40, 28][index];
            return (
              <div key={subject.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-muted-foreground">{value}%</span>
                </div>
                <Progress value={value} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
