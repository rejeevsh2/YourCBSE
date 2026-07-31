import { createFileRoute } from "@tanstack/react-router";
import { Route as MapIcon } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { LearningPathTimeline } from "@/components/student/LearningPathTimeline";
import { Progress } from "@/components/ui/progress";
import { learningPath, subjectMastery } from "@/data/student";

export const Route = createFileRoute("/student/learning-path")({
  head: () => ({
    meta: [
      { title: "Learning Path — YourCBSE" },
      { name: "description", content: "Your visual roadmap from grade to chapter mastery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LearningPathPage,
});

function LearningPathPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Learning Path"
      description="Grade → Subject → Chapter → Lesson → Quiz → Mastery. Here's exactly where you are."
    >
      <StatGrid
        items={[
          { label: "Path completion", value: "48%", hint: "On track", tone: "success" },
          { label: "Chapters mastered", value: "24 / 58", tone: "primary" },
          { label: "Current stage", value: "Lesson 4", hint: "Real Numbers", tone: "primary" },
          { label: "Est. to finish", value: "6 weeks", hint: "At 1h/day", tone: "warning" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LearningPathTimeline steps={learningPath} />
        </div>

        <StudioPanel title="Subject mastery" icon={MapIcon} className="h-fit">
          <ul className="space-y-4">
            {subjectMastery.map((subject) => (
              <li key={subject.id} className="space-y-2">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="min-w-0 truncate">{subject.label}</span>
                  <span className="font-semibold">{subject.value}%</span>
                </div>
                <Progress value={subject.value} aria-label={`${subject.label} mastery`} />
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
