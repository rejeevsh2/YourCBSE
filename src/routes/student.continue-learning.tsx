import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/lib/auth";

const API = API_BASE_URL;

type ContinueProgress = {
  id: number;
  user_id: number;
  lesson_id: number;
  is_completed: boolean;
  started_at: string | null;
  last_opened_at: string | null;
  completed_at: string | null;
  lesson: {
    id: number;
    chapter_id: number;
    title: string;
    slug: string;
    lesson_number: number;
    summary: string | null;
    duration: number | null;
    chapter: {
      id: number;
      unit_id: number;
      title: string;
      code: string | null;
      chapter_number: number | null;
      description: string | null;
      unit: {
        id: number;
        subject_id: number;
        title: string;
        code: string | null;
        unit_number: number | null;
        subject: {
          id: number;
          grade_id: number;
          name: string;
          code: string | null;
        };
      };
    };
  };
};

type ContinueResponse = {
  progress: ContinueProgress | null;
};

export const Route = createFileRoute(
  "/student/continue-learning",
)({
  head: () => ({
    meta: [
      {
        title: "Continue Learning — YourSchool",
      },
      {
        name: "description",
        content:
          "Resume your in-progress CBSE lessons.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: ContinueLearningPage,
});

function ContinueLearningPage() {
  const [progress, setProgress] =
    useState<ContinueProgress | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadContinueLearning() {
    const token = getAuthToken();

    if (!token) {
      setError("Your login session is unavailable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/lesson-progress/continue`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not load your learning progress.",
        );
      }

      const data: ContinueResponse =
        await response.json();

      setProgress(data.progress);
    } catch (err) {
      console.error(
        "Continue learning error:",
        err,
      );

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
    void loadContinueLearning();
  }, []);

  return (
   <PortalPage
  portalLabel="Student Portal"
  portalPath="/student"
  title="Continue Learning"
  description="Resume from where you last stopped."
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
            onClick={() =>
              void loadContinueLearning()
            }
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </section>
      ) : null}

      {!loading && !error && !progress ? (
        <section className="tile p-10 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 font-heading text-lg font-bold">
            Nothing to resume yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Open a lesson from the Learning Hub and
            your latest learning activity will appear here.
          </p>

          <Button
            className="mt-5 rounded-2xl"
            asChild
          >
            <Link to="/student/learning-hub">
              <BookOpen className="size-4" />
              Explore Learning Hub
            </Link>
          </Button>
        </section>
      ) : null}

      {!loading && !error && progress ? (
        <section className="tile p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              {progress.is_completed ? (
                <CheckCircle2 className="size-7" />
              ) : (
                <PlayCircle className="size-7" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full"
                >
                  {progress.lesson.chapter.unit.subject.name}
                </Badge>

                <Badge
                  variant="outline"
                  className="rounded-full"
                >
                  {progress.lesson.chapter.title}
                </Badge>

                {progress.lesson.duration ? (
                  <Badge
                    variant="outline"
                    className="rounded-full"
                  >
                    <Clock3 className="mr-1 size-3.5" />
                    {progress.lesson.duration} min
                  </Badge>
                ) : null}

                {progress.is_completed ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full"
                  >
                    <CheckCircle2 className="mr-1 size-3.5" />
                    Completed
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="rounded-full"
                  >
                    In Progress
                  </Badge>
                )}
              </div>

              <h2 className="mt-3 font-heading text-xl font-bold">
                {progress.lesson.title}
              </h2>

              {progress.lesson.summary ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {progress.lesson.summary}
                </p>
              ) : null}

              <p className="mt-2 text-xs text-muted-foreground">
                {progress.lesson.chapter.unit.title}
                {" · "}
                {progress.lesson.chapter.title}
              </p>
            </div>

            <Button
              className="shrink-0 rounded-2xl"
              asChild
            >
              <Link
                to="/student/lesson/$lessonId"
                params={{
                  lessonId: String(
                    progress.lesson.id,
                  ),
                }}
              >
                <PlayCircle className="size-4" />

                {progress.is_completed
                  ? "Review Lesson"
                  : "Resume Lesson"}
              </Link>
            </Button>
          </div>
        </section>
      ) : null}
    </PortalPage>
  );
}