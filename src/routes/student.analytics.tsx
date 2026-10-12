import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAuthToken } from "@/lib/auth";

const API = API_BASE_URL;

type DashboardStats = {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  percentage: number;
};

type AnalyticsSubject = {
  id: number;
  name: string;
  code: string | null;
  total_lessons: number;
  started_lessons: number;
  completed_lessons: number;
  percentage: number;
  grade: {
    id: number;
    name: string;
    grade_number: number | null;
  } | null;
};

type LearningPathResponse = {
  summary: {
    subjects: number;
    total_lessons: number;
    started_lessons: number;
    completed_lessons: number;
    percentage: number;
  };
  subjects: AnalyticsSubject[];
};

type RecentActivity = {
  id: number;
  lesson: string | null;
  chapter: string | null;
  subject: string | null;
  completed: boolean;
  time: string | null;
};

type RecentActivityResponse = {
  activities: RecentActivity[];
};

export const Route = createFileRoute(
  "/student/analytics",
)({
  head: () => ({
    meta: [
      {
        title: "Performance Analytics — YourSchool",
      },
      {
        name: "description",
        content:
          "Track real lesson completion, subject progress and recent learning activity.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: StudentAnalyticsPage,
});

function StudentAnalyticsPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [path, setPath] =
    useState<LearningPathResponse | null>(null);

  const [activities, setActivities] =
    useState<RecentActivity[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadAnalytics() {
    const token = getAuthToken();

    if (!token) {
      setError("Your login session is unavailable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [
        statsResponse,
        pathResponse,
        activityResponse,
      ] = await Promise.all([
        fetch(`${API}/dashboard/stats`, {
          headers,
        }),

        fetch(`${API}/learning-path`, {
          headers,
        }),

        fetch(`${API}/recent-activity`, {
          headers,
        }),
      ]);

      if (!statsResponse.ok) {
        throw new Error(
          "Could not load analytics statistics.",
        );
      }

      if (!pathResponse.ok) {
        throw new Error(
          "Could not load subject analytics.",
        );
      }

      if (!activityResponse.ok) {
        throw new Error(
          "Could not load recent activity.",
        );
      }

      const statsData: DashboardStats =
        await statsResponse.json();

      const pathData: LearningPathResponse =
        await pathResponse.json();

      const activityData: RecentActivityResponse =
        await activityResponse.json();

      setStats(statsData);
      setPath(pathData);
      setActivities(activityData.activities);
    } catch (err) {
      console.error(
        "Student analytics error:",
        err,
      );

      setStats(null);
      setPath(null);
      setActivities([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your analytics.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, []);

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Performance Analytics"
      description="Your real lesson completion, subject progress and recent learning activity."
      showNotice={false}
    >
      {loading ? (
        <section className="tile flex items-center justify-center gap-3 p-12">
          <Loader2 className="size-5 animate-spin" />

          <p className="text-sm text-muted-foreground">
            Loading your analytics...
          </p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="tile p-10 text-center">
          <Activity className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 font-heading text-lg font-bold">
            Analytics unavailable
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5 rounded-2xl"
            onClick={() =>
              void loadAnalytics()
            }
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </section>
      ) : null}

      {!loading &&
      !error &&
      stats &&
      path ? (
        <>
          <StatGrid
            items={[
              {
                label: "Overall completion",
                value: `${stats.percentage}%`,
                hint:
                  stats.percentage === 100
                    ? "All current lessons completed"
                    : "Based on published lessons",
                tone: "success",
              },
              {
                label: "Lessons completed",
                value: `${stats.completedLessons} / ${stats.totalLessons}`,
                hint: "Published lessons",
                tone: "primary",
              },
              {
                label: "Lessons in progress",
                value: String(
                  stats.inProgressLessons,
                ),
                hint: "Started but not completed",
                tone: "warning",
              },
              {
                label: "Subjects",
                value: String(
                  path.summary.subjects,
                ),
                hint: "Available learning subjects",
                tone: "primary",
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <StudioPanel
              title="Subject mastery"
              icon={BookOpen}
            >
              {path.subjects.length === 0 ? (
                <div className="py-6 text-center">
                  <BookOpen className="mx-auto size-9 text-muted-foreground" />

                  <p className="mt-3 text-sm text-muted-foreground">
                    No subject progress is available yet.
                  </p>
                </div>
              ) : (
                <ul className="space-y-5">
                  {path.subjects.map(
                    (subject) => (
                      <li
                        key={subject.id}
                        className="space-y-2"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {subject.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {subject.grade?.name ??
                                "Grade"}
                              {" · "}
                              {
                                subject.completed_lessons
                              }{" "}
                              of{" "}
                              {
                                subject.total_lessons
                              }{" "}
                              lessons completed
                            </p>
                          </div>

                          <span className="shrink-0 font-heading text-sm font-bold">
                            {
                              subject.percentage
                            }
                            %
                          </span>
                        </div>

                        <Progress
                          value={
                            subject.percentage
                          }
                          aria-label={`${subject.name} mastery`}
                        />
                      </li>
                    ),
                  )}
                </ul>
              )}
            </StudioPanel>

            <StudioPanel
              title="Recent learning activity"
              icon={Clock3}
            >
              {activities.length === 0 ? (
                <div className="py-6 text-center">
                  <Clock3 className="mx-auto size-9 text-muted-foreground" />

                  <p className="mt-3 text-sm text-muted-foreground">
                    No recent learning activity yet.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {activities.map(
                    (activity) => (
                      <li
                        key={activity.id}
                        className="tile flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                          {activity.completed ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <BookOpen className="size-5" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {activity.lesson ??
                              "Lesson activity"}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {activity.subject ??
                              "Subject"}

                            {activity.chapter
                              ? ` · ${activity.chapter}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant={
                              activity.completed
                                ? "secondary"
                                : "outline"
                            }
                            className="rounded-full"
                          >
                            {activity.completed
                              ? "Completed"
                              : "In progress"}
                          </Badge>

                          {activity.time ? (
                            <span className="text-xs text-muted-foreground">
                              {activity.time}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </StudioPanel>
          </div>

          <section className="tile p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  Detailed learning progress
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  View your complete subject, unit,
                  chapter and lesson roadmap.
                </p>
              </div>

              <Button
                variant="outline"
                className="rounded-2xl"
                asChild
              >
                <Link to="/student/learning-path">
                  <BookOpen className="size-4" />
                  Open Learning Path
                </Link>
              </Button>
            </div>
          </section>
        </>
      ) : null}
    </PortalPage>
  );
}