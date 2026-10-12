import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileQuestion,
  Loader2,
  XCircle,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { studentService } from "@/lib/student";

import type {
  PracticeAttempt,
  PracticeReviewResponse,
  PracticeSet,
} from "@/lib/student";

export const Route = createFileRoute(
  "/student/practice-set/$practiceSetId",
)({
  head: () => ({
    meta: [
      {
        title: "Practice — YourSchool",
      },
      {
        name: "description",
        content: "Complete your practice questions.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: PracticeAttemptPage,
});

function PracticeAttemptPage() {
  const { practiceSetId } = Route.useParams();

  const numericPracticeSetId = Number(practiceSetId);

  const [practiceSet, setPracticeSet] =
    useState<PracticeSet | null>(null);

  const [attempt, setAttempt] =
    useState<PracticeAttempt | null>(null);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, number>>({});

  const [review, setReview] =
    useState<PracticeReviewResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [startedAt, setStartedAt] =
    useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPracticeSet() {
      if (
        !Number.isInteger(numericPracticeSetId) ||
        numericPracticeSetId <= 0
      ) {
        setError("Invalid practice set.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result =
        await studentService.getPracticeSet(
          numericPracticeSetId,
        );

      if (!active) {
        return;
      }

      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setPracticeSet(result.data.practice_set);
      setLoading(false);
    }

    void loadPracticeSet();

    return () => {
      active = false;
    };
  }, [numericPracticeSetId]);

  const questions = useMemo(
    () => practiceSet?.questions ?? [],
    [practiceSet],
  );

  const answeredCount = Object.keys(
    selectedAnswers,
  ).length;

  const progress =
    questions.length > 0
      ? Math.round(
          (answeredCount / questions.length) * 100,
        )
      : 0;

  async function handleBegin() {
    if (!practiceSet) {
      return;
    }

    setStarting(true);
    setError(null);
    setReview(null);
    setSelectedAnswers({});

    const result =
      await studentService.startPracticeSet(
        practiceSet.id,
      );

    if (!result.ok) {
      setError(result.message);
      setStarting(false);
      return;
    }

    setAttempt(result.data.attempt);
    setStartedAt(Date.now());
    setStarting(false);
  }

  function selectAnswer(
    questionId: number,
    optionId: number,
  ) {
    if (!attempt || submitting) {
      return;
    }

    setSelectedAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }

  async function handleSubmit() {
    if (!attempt || !practiceSet) {
      return;
    }

    if (answeredCount !== questions.length) {
      setError(
        "Please answer every question before submitting.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    const totalTimeSpent =
      startedAt !== null
        ? Math.max(
            0,
            Math.floor(
              (Date.now() - startedAt) / 1000,
            ),
          )
        : 0;

    const answers = questions.map(
      (question) => ({
        question_id: question.id,
        option_id:
          selectedAnswers[question.id],
        time_spent_seconds: 0,
      }),
    );

    const result =
      await studentService.submitPracticeAttempt(
        attempt.id,
        {
          answers,
          time_spent_seconds: totalTimeSpent,
        },
      );

    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    setAttempt(result.data.attempt);
    setSubmitting(false);
  }

  async function handleReview() {
    if (!attempt) {
      return;
    }

    setReviewLoading(true);
    setError(null);

    const result =
      await studentService.reviewPracticeAttempt(
        attempt.id,
      );

    if (!result.ok) {
      setError(result.message);
      setReviewLoading(false);
      return;
    }

    setReview(result.data);
    setReviewLoading(false);
  }

  if (loading) {
    return (
      <PortalPage
        portalLabel="Student Portal"
        portalPath="/student"
        title="Practice"
        description="Loading your practice set."
        showNotice={false}
      >
        <div className="flex min-h-64 items-center justify-center rounded-3xl border bg-card">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading practice...
          </div>
        </div>
      </PortalPage>
    );
  }

  if (error && !practiceSet) {
    return (
      <PortalPage
        portalLabel="Student Portal"
        portalPath="/student"
        title="Practice"
        description="We couldn't open this practice set."
        showNotice={false}
      >
        <div className="rounded-3xl border bg-card p-8">
          <p className="text-sm text-destructive">
            {error}
          </p>

          <Button
            asChild
            variant="outline"
            className="mt-5 rounded-2xl"
          >
            <Link to="/student/practice">
              <ArrowLeft className="mr-2 size-4" />
              Back to Practice Center
            </Link>
          </Button>
        </div>
      </PortalPage>
    );
  }

  if (!practiceSet) {
    return null;
  }

  const completed =
    attempt?.status === "completed";

 return (
  <PortalPage
    portalLabel="Student Portal"
    portalPath="/student"
    title={practiceSet.title}
    description={
      practiceSet.description ??
      "Complete the questions and submit your answers."
    }
    showNotice={false}
  >
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-2xl"
        >
          <Link to="/student/practice">
            <ArrowLeft className="mr-2 size-4" />
            Practice Center
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Questions
          </p>

          <p className="mt-2 text-2xl font-bold">
            {questions.length}
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Duration
          </p>

          <p className="mt-2 text-2xl font-bold">
            {practiceSet.duration_minutes
              ? `${practiceSet.duration_minutes} min`
              : "Untimed"}
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </p>

          <div className="mt-2">
            <Badge
              variant="secondary"
              className="rounded-full"
            >
              {completed
                ? "Completed"
                : attempt
                  ? "In progress"
                  : "Ready"}
            </Badge>
          </div>
        </div>
      </div>

      {!attempt ? (
        <section className="rounded-3xl border bg-card p-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileQuestion className="size-7" />
            </div>

            <h2 className="mt-4 font-heading text-xl font-bold">
              Ready to begin?
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              This practice contains{" "}
              {questions.length}{" "}
              {questions.length === 1
                ? "question"
                : "questions"}.
              {practiceSet.duration_minutes
                ? ` Suggested duration: ${practiceSet.duration_minutes} minutes.`
                : ""}
            </p>

            {error ? (
              <p
                className="mt-4 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Button
              className="mt-6 rounded-2xl px-8"
              disabled={starting}
              onClick={() => {
                void handleBegin();
              }}
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Begin Practice"
              )}
            </Button>
          </div>
        </section>
      ) : completed ? (
        <>
          <section className="rounded-3xl border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto size-12 text-success" />

            <h2 className="mt-4 font-heading text-xl font-bold">
              Practice completed
            </h2>

            <p className="mt-2 text-3xl font-bold">
              {attempt.percentage}%
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Score {attempt.score} /{" "}
              {attempt.max_score}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                className="rounded-2xl"
                disabled={reviewLoading}
                onClick={() => {
                  void handleReview();
                }}
              >
                {reviewLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Loading Review...
                  </>
                ) : (
                  <>
                    <FileQuestion className="mr-2 size-4" />
                    Review Answers
                  </>
                )}
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-2xl"
              >
                <Link to="/student/practice">
                  Back to Practice Center
                </Link>
              </Button>
            </div>

            {error ? (
              <p
                className="mt-4 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </section>

          {review ? (
            <section className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold">
                  Answer Review
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Review your answers and explanations.
                </p>
              </div>

              {review.review.map(
                (item, index) => (
                  <article
                    key={item.question_id}
                    className="rounded-3xl border bg-card p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full"
                      >
                        Question {index + 1}
                      </Badge>

                      {item.is_correct ? (
                        <Badge className="rounded-full">
                          Correct
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="rounded-full"
                        >
                          Incorrect
                        </Badge>
                      )}

                      <span className="ml-auto text-sm font-semibold">
                        {item.marks_awarded} marks
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold">
                      {item.question}
                    </h3>

                    <div className="mt-5 grid gap-3">
                      <div
                        className={[
                          "rounded-2xl border p-4",
                          item.is_correct
                            ? "border-success/30 bg-success/5"
                            : "border-destructive/30 bg-destructive/5",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          {item.is_correct ? (
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                          ) : (
                            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                          )}

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Your answer
                            </p>

                            <p className="mt-1 font-medium">
                              {item.selected_option
                                ? item.selected_option.text
                                : "No answer"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!item.is_correct ? (
                        <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Correct answer
                              </p>

                              <p className="mt-1 font-medium">
                                {item.correct_option
                                  ? item.correct_option.text
                                  : "Not available"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {item.explanation ? (
                      <div className="mt-5 rounded-2xl bg-muted/50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Explanation
                        </p>

                        <p className="mt-2 text-sm leading-6">
                          {item.explanation}
                        </p>
                      </div>
                    ) : null}

                    <p className="mt-4 text-xs text-muted-foreground">
                      Time spent:{" "}
                      {item.time_spent_seconds} seconds
                    </p>
                  </article>
                ),
              )}
            </section>
          ) : null}
        </>
      ) : (
        <>
          <section className="rounded-3xl border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Your progress
                </p>

                <p className="text-xs text-muted-foreground">
                  {answeredCount} of{" "}
                  {questions.length} answered
                </p>
              </div>

              <span className="text-sm font-bold">
                {progress}%
              </span>
            </div>

            <Progress
              value={progress}
              className="mt-3"
              aria-label="Practice progress"
            />
          </section>

          <div className="space-y-5">
            {questions.map(
              (question, questionIndex) => (
                <section
                  key={question.id}
                  className="rounded-3xl border bg-card p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full"
                    >
                      Question {questionIndex + 1}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="rounded-full"
                    >
                      {question.difficulty}
                    </Badge>

                    <span className="ml-auto text-xs text-muted-foreground">
                      {question.marks} mark
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-semibold">
                    {question.question_text}
                  </h2>

                  {question.image_url ? (
                    <img
                      src={question.image_url}
                      alt=""
                      className="mt-4 max-h-80 rounded-2xl border object-contain"
                    />
                  ) : null}

                  <div className="mt-5 grid gap-3">
                    {question.options.map(
                      (option, optionIndex) => {
                        const selected =
                          selectedAnswers[
                            question.id
                          ] === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              selectAnswer(
                                question.id,
                                option.id,
                              )
                            }
                            className={[
                              "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition",
                              selected
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-primary/40 hover:bg-muted/40",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "bg-background",
                              ].join(" ")}
                            >
                              {String.fromCharCode(
                                65 + optionIndex,
                              )}
                            </span>

                            <span className="flex-1 text-sm font-medium">
                              {option.option_text}
                            </span>

                            {selected ? (
                              <CheckCircle2 className="size-5 shrink-0 text-primary" />
                            ) : null}
                          </button>
                        );
                      },
                    )}
                  </div>
                </section>
              ),
            )}
          </div>

          {error ? (
            <div
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <section className="flex flex-col gap-3 rounded-3xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                Ready to submit?
              </p>

              <p className="text-sm text-muted-foreground">
                {answeredCount} of{" "}
                {questions.length} questions answered.
              </p>
            </div>

            <Button
              className="rounded-2xl"
              disabled={
                submitting ||
                answeredCount !== questions.length
              }
              onClick={() => {
                void handleSubmit();
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Clock className="mr-2 size-4" />
                  Submit Practice
                </>
              )}
            </Button>
          </section>
        </>
      )}
    </PortalPage>
  );
}