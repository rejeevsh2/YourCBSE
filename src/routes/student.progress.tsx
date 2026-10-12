import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth";

const API = API_BASE_URL;

type DashboardStats = {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  percentage: number;
};

type LearningPathSubject = {
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
  };
};

type LearningPathResponse = {
  summary: {
    subjects: number;
    total_lessons: number;
    started_lessons: number;
    completed_lessons: number;
    percentage: number;
  };
  subjects: LearningPathSubject[];
};

export const Route = createFileRoute("/student/progress")({
  head: () => ({
    meta: [
      {
        title: "My Progress — YourSchool",
      },
      {
        name: "description",
        content:
          "Track your real lesson completion across your subjects.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: ProgressPage,
});

function ProgressPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [path, setPath] =
    useState<LearningPathResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadProgress() {
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

      const [statsResponse, pathResponse] =
        await Promise.all([
          fetch(`${API}/dashboard/stats`, {
            headers,
          }),

          fetch(`${API}/learning-path`, {
            headers,
          }),
        ]);

      if (!statsResponse.ok) {
        throw new Error(
          "Could not load your progress statistics.",
        );
      }

      if (!pathResponse.ok) {
        throw new Error(
          "Could not load your subject progress.",
        );
      }

      const statsData: DashboardStats =
        await statsResponse.json();

      const pathData: LearningPathResponse =
        await pathResponse.json();

      setStats(statsData);
      setPath(pathData);
    } catch (err) {
      console.error("Progress page error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your progress.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProgress();
  }, []);

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="My Progress"
      description="Track your lesson completion across every subject."
      showNotice={false}
    >
      {loading ? (
        <section className="tile flex items-center justify-center gap-3 p-12">
          <Loader2 className="size-5 animate-spin" />

          <p className="text-sm text-muted-foreground">
            Loading your progress...
          </p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="tile p-10 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 font-heading text-lg font-bold">
            Progress unavailable
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5 rounded-2xl"
            onClick={() => void loadProgress()}
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </section>
      ) : null}

      {!loading && !error && stats && path ? (
        <>
          <StatGrid
            items={[
              {
                label: "Overall completion",
                value: `${stats.percentage}%`,
                hint:
                  stats.percentage === 100
                    ? "Completed"
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
                label: "In progress",
                value: String(
                  stats.inProgressLessons,
                ),
                hint: "Started lessons",
                tone: "warning",
              },
              {
                label: "Subjects",
                value: String(
                  path.summary.subjects,
                ),
                hint: "Learning subjects",
                tone: "primary",
              },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle>
                Subject-wise progress
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {path.subjects.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen className="mx-auto size-9 text-muted-foreground" />

                  <p className="mt-3 text-sm text-muted-foreground">
                    No subject progress is available yet.
                  </p>
                </div>
              ) : (
                path.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="space-y-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {subject.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {subject.grade.name}
                          {" · "}
                          {subject.completed_lessons} of{" "}
                          {subject.total_lessons} lessons
                          completed
                        </p>
                      </div>

                      <span className="font-heading text-sm font-bold">
                        {subject.percentage}%
                      </span>
                    </div>

                    <Progress
                      value={subject.percentage}
                      aria-label={`${subject.name} progress`}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </PortalPage>
  );
}