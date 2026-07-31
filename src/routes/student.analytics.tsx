import { createFileRoute } from "@tanstack/react-router";
import { Flame, ThumbsDown, ThumbsUp } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { BarChart, ChartPanel, LineChart, RankedBars } from "@/components/admin/Charts";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { StreakHeatmap } from "@/components/student/StreakHeatmap";
import { Progress } from "@/components/ui/progress";
import {
  chaptersCompletedSeries,
  learner,
  monthLabelsShort,
  scoreTrend,
  streakCalendar,
  strongTopics,
  studyHoursSeries,
  subjectMastery,
  weakTopics,
} from "@/data/student";

export const Route = createFileRoute("/student/analytics")({
  head: () => ({
    meta: [
      { title: "Performance Analytics — YourCBSE" },
      { name: "description", content: "Study hours, scores, strong topics and weak topics at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentAnalyticsPage,
});

function StudentAnalyticsPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Performance Analytics"
      description="What's working, what needs attention, and how far you've come."
    >
      <StatGrid
        items={[
          { label: "Study hours", value: "112.9", hint: "Last 12 months", tone: "primary" },
          { label: "Chapters completed", value: "24", hint: "+3 this week", tone: "success" },
          { label: "Average score", value: "88%", hint: "+6 pts", tone: "success" },
          { label: "Learning streak", value: `${learner.streak} days`, hint: `Best ${learner.longestStreak}`, tone: "warning" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Study hours" subtitle="Hours per month">
          <BarChart data={studyHoursSeries} labels={monthLabelsShort} ariaLabel="Study hours per month" />
        </ChartPanel>

        <ChartPanel title="Average score" subtitle="Rolling test average">
          <LineChart
            data={scoreTrend}
            labels={monthLabelsShort}
            ariaLabel="Average score trend"
            stroke="var(--color-success)"
          />
        </ChartPanel>

        <ChartPanel title="Chapters completed" subtitle="Per month">
          <BarChart
            data={chaptersCompletedSeries}
            labels={monthLabelsShort}
            tone="success"
            ariaLabel="Chapters completed per month"
          />
        </ChartPanel>

        <StudioPanel title="Learning streak" icon={Flame}>
          <StreakHeatmap days={streakCalendar} />
          <p className="text-sm text-muted-foreground">
            {learner.streak}-day streak · longest run {learner.longestStreak} days.
          </p>
        </StudioPanel>

        <ChartPanel title="Weak topics" subtitle="Lowest accuracy — revise these first">
          <RankedBars items={weakTopics} ariaLabel="Weak topics" />
        </ChartPanel>

        <ChartPanel title="Strong topics" subtitle="Highest accuracy">
          <RankedBars items={strongTopics} ariaLabel="Strong topics" />
        </ChartPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Subject mastery" icon={ThumbsUp}>
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

        <StudioPanel title="Suggested focus" icon={ThumbsDown}>
          <ul className="space-y-3">
            {weakTopics.map((topic) => (
              <li key={topic.id} className="tile flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{topic.label}</p>
                  <p className="text-xs text-muted-foreground">{topic.caption}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-warning">{topic.value}</span>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
