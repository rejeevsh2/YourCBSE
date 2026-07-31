import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudyAssistant } from "@/components/student/StudyAssistant";
import { LaunchCard } from "@/components/student/LaunchCard";
import { assistantSkills } from "@/data/student";

export const Route = createFileRoute("/student/assistant")({
  head: () => ({
    meta: [
      { title: "AI Study Assistant — YourCBSE" },
      { name: "description", content: "Ask questions, generate MCQs, summarise chapters and get study tips." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="AI Study Assistant"
      description="A tutor that knows your syllabus, your pace and your weak topics."
    >
      <div className="grid gap-4 lg:grid-cols-5">
        <StudyAssistant className="min-h-[32rem] lg:col-span-3" />

        <div className="space-y-4 lg:col-span-2">
          <h2 className="font-heading text-lg font-bold">What it can do</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {assistantSkills.map((skill) => (
              <LaunchCard
                key={skill.id}
                title={skill.title}
                description={skill.description}
                meta={`e.g. "${skill.prompt}"`}
                icon={skill.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </PortalPage>
  );
}
