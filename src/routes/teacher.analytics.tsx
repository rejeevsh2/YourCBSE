import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Flame } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Progress } from "@/components/ui/progress";
import { studioAnalytics, topChapters } from "@/data/teacher";

export const Route = createFileRoute("/teacher/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Teacher Studio" },
      { name: "description", content: "Views, completion, study time and quiz attempts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Analytics"
      description="How your content performs across grades and classes."
      showNotice={false}
    >
      <StatGrid items={studioAnalytics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Top chapters" icon={Flame}>
          <ul className="space-y-3">
            {topChapters.map((chapter, index) => (
              <li key={chapter.id} className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
                <span className="font-heading flex size-8 shrink-0 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-accent-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate text-sm font-medium">{chapter.title}</p>
                  <Progress
                    value={chapter.completion}
                    className="h-2"
                    aria-label={`${chapter.title} completion`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {chapter.views.toLocaleString()} views · {chapter.completion}% completion
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Engagement trend" icon={BarChart3}>
          <div
            className="flex h-56 items-end gap-2 rounded-2xl bg-accent/30 p-4"
            role="img"
            aria-label="Placeholder engagement chart for the last twelve weeks"
          >
            {[38, 52, 44, 61, 58, 72, 66, 80, 74, 88, 82, 94].map((value, index) => (
              <span
                key={index}
                className="flex-1 rounded-t-lg bg-primary/70 transition-all hover:bg-primary"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Placeholder visualisation — real metrics arrive with the Laravel integration.
          </p>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
