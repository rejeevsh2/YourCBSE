import { createFileRoute } from "@tanstack/react-router";
import { Repeat2 } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { LaunchCard } from "@/components/student/LaunchCard";
import { RevisionTimer } from "@/components/student/RevisionTimer";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { revisionQueue } from "@/data/student";
import { revisionCategories } from "@/data/student-library";

export const Route = createFileRoute("/student/revision")({
  head: () => ({
    meta: [
      { title: "Revision Hub — YourCBSE" },
      { name: "description", content: "Notes, formulas, mind maps, flash cards and timed revision in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RevisionHubPage,
});

function RevisionHubPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Revision Hub"
      description="Everything you need for a focused revision session, in one place."
    >
      <StatGrid
        items={[
          { label: "Cards due today", value: "12", hint: "5 min", tone: "warning" },
          { label: "Notes saved", value: "58", tone: "primary" },
          { label: "Revision streak", value: "7 days", hint: "Personal best 21", tone: "success" },
          { label: "Recall accuracy", value: "84%", hint: "+6% this week", tone: "success" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {revisionCategories.map((tile) => (
            <LaunchCard key={tile.id} {...tile} />
          ))}
        </div>

        <div className="space-y-4">
          <RevisionTimer />

          <StudioPanel title="Due for review" icon={Repeat2}>
            <ul className="space-y-4">
              {revisionQueue.map((item) => (
                <li key={item.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 text-sm font-medium">{item.title}</p>
                    <Badge variant="secondary" className="shrink-0 rounded-full text-[11px]">
                      {item.due}
                    </Badge>
                  </div>
                  <Progress value={item.strength} aria-label={`${item.title} memory strength`} />
                  <p className="text-xs text-muted-foreground">Memory strength {item.strength}%</p>
                </li>
              ))}
            </ul>
          </StudioPanel>
        </div>
      </div>
    </PortalPage>
  );
}
