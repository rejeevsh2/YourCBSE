import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileQuestion,
  History,
  Play,
  XCircle,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { studentService } from "@/lib/student";

import type {
  PracticeHistoryAttempt,
  PracticeSet,
} from "@/lib/student";

export const Route = createFileRoute("/student/practice")({
  head: () => ({
    meta: [
      {
        title: "Practice Center — YourTeacher",
      },
      {
        name: "description",
        content:
          "MCQs, timed quizzes, mock exams and previous year papers.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: PracticeCentrePage,
});

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function formatAttemptDate(value: string | null) {
  if (!value) {
    return "Not submitted";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PracticeCentrePage() {
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  const [history, setHistory] = useState<PracticeHistoryAttempt[]>([]);

  const [practiceLoading, setPracticeLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [practiceError, setPracticeError] = useState<string | null>(
    null,
  );

  const [historyError, setHistoryError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    async function loadPracticeSets() {
      setPracticeLoading(true);
      setPracticeError(null);

      const result = await studentService.getPracticeSets();

      if (!active) {
        return;
      }

      if (!result.ok) {
        setPracticeError(result.message);
        setPracticeLoading(false);
        return;
      }

      setPracticeSets(result.data.practice_sets);
      setPracticeLoading(false);
    }

    async function loadPracticeHistory() {
      setHistoryLoading(true);
      setHistoryError(null);

      const result = await studentService.getPracticeHistory();

      if (!active) {
        return;
      }

      if (!result.ok) {
        setHistoryError(result.message);
        setHistoryLoading(false);
        return;
      }

      setHistory(result.data.attempts);
      setHistoryLoading(false);
    }

    void loadPracticeSets();
    void loadPracticeHistory();

    return () => {
      active = false;
    };
  }, []);

  const totalQuestions = practiceSets.reduce(
    (total, practiceSet) =>
      total + (practiceSet.questions_count ?? 0),
    0,
  );

  const subjects = new Set(
    practiceSets
      .map((practiceSet) => practiceSet.subject?.name)
      .filter(Boolean),
  ).size;

  const completedAttempts = history.filter(
    (attempt) => attempt.status === "completed",
  );

  const averagePercentage =
    completedAttempts.length > 0
      ? completedAttempts.reduce(
          (total, attempt) =>
            total + Number(attempt.percentage || 0),
          0,
        ) / completedAttempts.length
      : 0;

  return (
    <PortalPage
  portalLabel="Student Portal"
  portalPath="/student"
  title="Practice Center"
  description="Pick a practice set, test your knowledge, and track your progress."
  showNotice={false}
>
      <StatGrid
        items={[
          {
            label: "Available sets",
            value: String(practiceSets.length),
            hint: "Published practice",
            tone: "primary",
          },
          {
            label: "Questions available",
            value: String(totalQuestions),
            hint: "Ready to solve",
            tone: "success",
          },
          {
            label: "Attempts",
            value: String(history.length),
            hint: "Practice history",
            tone: "primary",
          },
          {
            label: "Average accuracy",
            value:
              completedAttempts.length > 0
                ? `${averagePercentage.toFixed(0)}%`
                : "—",
            hint:
              completedAttempts.length > 0
                ? `${completedAttempts.length} completed`
                : "No completed attempts",
            tone: "success",
          },
        ]}
      />

      {practiceError ? (
        <div
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          role="alert"
        >
          {practiceError}
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-bold">
            Available Practice
          </h2>

          <p className="text-sm text-muted-foreground">
            Choose a practice set to begin.
          </p>
        </div>

        {practiceLoading ? (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading practice sets...
            </p>
          </div>
        ) : practiceSets.length === 0 ? (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <FileQuestion className="mx-auto mb-3 size-8 text-muted-foreground" />

            <h3 className="font-semibold">
              No practice sets available
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Published practice sets will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {practiceSets.map((practiceSet) => (
              <article
                key={practiceSet.id}
                className="flex flex-col rounded-3xl border bg-card p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>

                  <Badge
                    variant="secondary"
                    className="rounded-full"
                  >
                    {practiceSet.type.toUpperCase()}
                  </Badge>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-base font-bold">
                    {practiceSet.title}
                  </h3>

                  {practiceSet.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {practiceSet.description}
                    </p>
                  ) : null}

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {practiceSet.subject ? (
                      <p>
                        <span className="font-medium text-foreground">
                          Subject:
                        </span>{" "}
                        {practiceSet.subject.name}
                      </p>
                    ) : null}

                    {practiceSet.chapter ? (
                      <p>
                        <span className="font-medium text-foreground">
                          Chapter:
                        </span>{" "}
                        {practiceSet.chapter.title}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <FileQuestion className="size-4" />

                        {practiceSet.questions_count ?? 0}{" "}
                        {practiceSet.questions_count === 1
                          ? "question"
                          : "questions"}
                      </span>

                      {practiceSet.duration_minutes ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-4" />
                          {practiceSet.duration_minutes} min
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className="mt-5 w-full rounded-2xl"
                >
                  <Link
                    to="/student/practice-set/$practiceSetId"
                    params={{
                      practiceSetId: String(practiceSet.id),
                    }}
                  >
                    <Play className="mr-2 size-4" />
                    Start Practice
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <History className="size-5" />
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold">
              Recent Attempts
            </h2>

            <p className="text-sm text-muted-foreground">
              Review your previous practice results and answers.
            </p>
          </div>
        </div>

        {historyError ? (
          <div
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            role="alert"
          >
            {historyError}
          </div>
        ) : null}

        {historyLoading ? (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading practice history...
            </p>
          </div>
        ) : historyError ? null : history.length === 0 ? (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <History className="mx-auto mb-3 size-8 text-muted-foreground" />

            <h3 className="font-semibold">
              No practice history yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Complete your first practice set and the result will
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((attempt) => (
              <article
                key={attempt.id}
                className="rounded-3xl border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-base font-bold">
                        {attempt.practice_set?.title ??
                          "Practice Attempt"}
                      </h3>

                      <Badge
                        variant={
                          attempt.status === "completed"
                            ? "secondary"
                            : "outline"
                        }
                        className="rounded-full"
                      >
                        {attempt.status}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {attempt.practice_set?.subject ? (
                        <span>
                          {attempt.practice_set.subject.name}
                        </span>
                      ) : null}

                      {attempt.practice_set?.chapter ? (
                        <span>
                          {attempt.practice_set.chapter.title}
                        </span>
                      ) : null}

                      <span>
                        {formatAttemptDate(
                          attempt.submitted_at ??
                            attempt.started_at,
                        )}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatTime(
                          attempt.time_spent_seconds,
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <span className="font-semibold">
                        Score: {attempt.score}/
                        {attempt.max_score}
                      </span>

                      <span className="font-semibold">
                        {attempt.percentage}%
                      </span>

                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <CheckCircle2 className="size-4" />
                        {attempt.correct_answers} correct
                      </span>

                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <XCircle className="size-4" />
                        {attempt.wrong_answers} wrong
                      </span>
                    </div>
                  </div>

                  {attempt.status === "completed" ? (
                    <Button
                      asChild
                      variant="outline"
                      className="shrink-0 rounded-2xl"
                    >
                      <Link
                        to="/student/practice-review/$attemptId"
                        params={{
                          attemptId: String(attempt.id),
                        }}
                      >
                        Review
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PortalPage>
  );
}