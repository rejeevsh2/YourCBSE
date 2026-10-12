import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileQuestion,
  XCircle,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { studentService } from "@/lib/student";

import type { PracticeReviewResponse } from "@/lib/student";

export const Route = createFileRoute(
  "/student/practice-review/$attemptId",
)({
  head: () => ({
    meta: [
      {
        title: "Practice Review — YourTeacher",
      },
      {
        name: "description",
        content: "Review your practice answers and results.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: PracticeReviewPage,
});

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function PracticeReviewPage() {
  const { attemptId } = Route.useParams();

  const [reviewData, setReviewData] =
    useState<PracticeReviewResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReview() {
      setLoading(true);
      setError(null);

      const numericAttemptId = Number(attemptId);

      if (
        !Number.isInteger(numericAttemptId) ||
        numericAttemptId <= 0
      ) {
        setError("Invalid practice attempt.");
        setLoading(false);
        return;
      }

      const result =
        await studentService.reviewPracticeAttempt(
          numericAttemptId,
        );

      if (!active) {
        return;
      }

      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setReviewData(result.data);
      setLoading(false);
    }

    void loadReview();

    return () => {
      active = false;
    };
  }, [attemptId]);

  if (loading) {
    return (
      <PortalPage
        portalLabel="Student Portal"
        portalPath="/student"
        title="Practice Review"
        description="Loading your practice result..."
        showNotice={false}
      >
        <div className="rounded-3xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Loading review...
          </p>
        </div>
      </PortalPage>
    );
  }

  if (error || !reviewData) {
    return (
      <PortalPage
        portalLabel="Student Portal"
        portalPath="/student"
        title="Practice Review"
        description="We could not load this practice attempt."
        showNotice={false}
      >
        <div
          className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6"
          role="alert"
        >
          <p className="text-sm text-destructive">
            {error ?? "Practice review is unavailable."}
          </p>

          <Button
            asChild
            variant="outline"
            className="mt-4 rounded-2xl"
          >
            <Link to="/student/practice">
              <ArrowLeft className="mr-2 size-4" />
              Back to Practice
            </Link>
          </Button>
        </div>
      </PortalPage>
    );
  }

  const { attempt, practice_set: practiceSet, review } =
    reviewData;

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Practice Review"
      description={practiceSet.title}
      showNotice={false}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          asChild
          variant="outline"
          className="rounded-2xl"
        >
          <Link to="/student/practice">
            <ArrowLeft className="mr-2 size-4" />
            Back to Practice
          </Link>
        </Button>

        <Badge
          variant="secondary"
          className="rounded-full px-3 py-1"
        >
          {practiceSet.type.toUpperCase()}
        </Badge>
      </div>

      <StatGrid
        items={[
          {
            label: "Score",
            value: `${attempt.score}/${attempt.max_score}`,
            hint: `${attempt.percentage}%`,
            tone: "primary",
          },
          {
            label: "Correct",
            value: String(attempt.correct_answers),
            hint: `${attempt.total_questions} questions`,
            tone: "success",
          },
          {
            label: "Wrong",
            value: String(attempt.wrong_answers),
            hint: `${attempt.answered_questions} answered`,
            tone: "warning",
          },
          {
            label: "Time",
            value: formatTime(attempt.time_spent_seconds),
            hint: "Total time",
            tone: "primary",
          },
        ]}
      />

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-bold">
            Answer Review
          </h2>

          <p className="text-sm text-muted-foreground">
            Check your answers, correct answers, and explanations.
          </p>
        </div>

        {review.length === 0 ? (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <FileQuestion className="mx-auto mb-3 size-8 text-muted-foreground" />

            <h3 className="font-semibold">
              No answers to review
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              This attempt does not contain review information.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {review.map((item, index) => (
              <article
                key={item.question_id}
                className="rounded-3xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Question {index + 1}
                    </p>

                    <h3 className="mt-1 font-heading text-base font-bold">
                      {item.question}
                    </h3>
                  </div>

                  {item.is_correct ? (
                    <Badge className="shrink-0 rounded-full">
                      <CheckCircle2 className="mr-1 size-3.5" />
                      Correct
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="shrink-0 rounded-full"
                    >
                      <XCircle className="mr-1 size-3.5" />
                      Incorrect
                    </Badge>
                  )}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Your answer
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {item.selected_option?.text ??
                        "Not answered"}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Correct answer
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {item.correct_option?.text ??
                        "Not available"}
                    </p>
                  </div>
                </div>

                {item.explanation ? (
                  <div className="mt-4 rounded-2xl bg-muted/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Explanation
                    </p>

                    <p className="mt-2 text-sm leading-6">
                      {item.explanation}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>
                    Marks: {item.marks_awarded}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {formatTime(item.time_spent_seconds)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PortalPage>
  );
}