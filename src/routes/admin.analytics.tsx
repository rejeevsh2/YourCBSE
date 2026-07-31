import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { BarChart, ChartPanel, LineChart, RankedBars, SegmentedBar } from "@/components/admin/Charts";
import { StatCard } from "@/components/common/StatCard";
import { Progress } from "@/components/ui/progress";
import {
  completionRates,
  downloadsSeries,
  monthLabels,
  mostViewedChapters,
  platformActivityBreakdown,
  quizAttempts,
  studentGrowth,
  teacherGrowth,
  trafficSeries,
} from "@/data/admin";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — YourCBSE Admin" },
      { name: "description", content: "Growth, traffic, engagement and completion analytics." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Analytics"
      description="Growth, traffic, engagement and content performance across the platform."
      actions={
        <Button variant="outline" className="rounded-2xl">
          <Download className="size-4" /> Export
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sessions" value="486,900" hint="+11.2% MoM" tone="success" />
        <StatCard label="Avg. session" value="9m 42s" hint="+38s" tone="success" />
        <StatCard label="Quiz attempts" value="4,860" hint="Last 30 days" tone="primary" />
        <StatCard label="Downloads" value="2,742" hint="+6.1%" tone="primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Student growth" subtitle="New students per month">
          <LineChart data={studentGrowth} labels={monthLabels} ariaLabel="Student growth" />
        </ChartPanel>
        <ChartPanel title="Teacher growth" subtitle="New teachers per month">
          <LineChart
            data={teacherGrowth}
            labels={monthLabels}
            ariaLabel="Teacher growth"
            stroke="var(--color-success)"
          />
        </ChartPanel>
        <ChartPanel title="Traffic" subtitle="Sessions per month">
          <BarChart data={trafficSeries} labels={monthLabels} ariaLabel="Traffic" />
        </ChartPanel>
        <ChartPanel title="Quiz attempts" subtitle="Attempts per month">
          <BarChart data={quizAttempts} labels={monthLabels} tone="success" ariaLabel="Quiz attempts" />
        </ChartPanel>
        <ChartPanel title="Downloads" subtitle="Resource downloads per month">
          <BarChart
            data={downloadsSeries}
            labels={monthLabels}
            tone="warning"
            ariaLabel="Downloads"
          />
        </ChartPanel>
        <ChartPanel title="Platform activity" subtitle="Share of tracked events">
          <SegmentedBar items={platformActivityBreakdown} ariaLabel="Platform activity" />
        </ChartPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Most viewed chapters" subtitle="Last 30 days">
          <RankedBars
            ariaLabel="Most viewed chapters"
            items={mostViewedChapters.map((chapter) => ({
              id: chapter.id,
              label: chapter.title,
              caption: chapter.grade,
              value: `${(chapter.views / 1000).toFixed(1)}k`,
              share: chapter.share,
            }))}
          />
        </ChartPanel>

        <ChartPanel title="Completion rate" subtitle="Average lesson completion by cohort">
          <ul className="space-y-4">
            {completionRates.map((entry) => (
              <li key={entry.id} className="space-y-2">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="min-w-0 truncate">{entry.label}</span>
                  <span className="font-semibold">{entry.value}%</span>
                </div>
                <Progress value={entry.value} aria-label={`${entry.label} completion`} />
              </li>
            ))}
          </ul>
        </ChartPanel>
      </div>
    </PortalPage>
  );
}
