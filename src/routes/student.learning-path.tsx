import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  GraduationCap,
  Layers3,
  Loader2,
  Map as MapIcon,
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

type PathLesson = {
  id: number;
  title: string;
  slug: string;
  lesson_number: number;
  duration: number | null;
  is_started: boolean;
  is_completed: boolean;
  last_opened_at: string | null;
};

type PathChapter = {
  id: number;
  title: string;
  code: string | null;
  chapter_number: number | null;
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
  lessons: PathLesson[];
};

type PathUnit = {
  id: number;
  title: string;
  code: string | null;
  unit_number: number | null;
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
  chapters: PathChapter[];
};

type PathSubject = {
  id: number;
  name: string;
  code: string | null;
  icon: string | null;
  color: string | null;

  grade: {
    id: number;
    name: string;
    grade_number: number | null;
  } | null;

  total_lessons: number;
  started_lessons: number;
  completed_lessons: number;
  percentage: number;
  units: PathUnit[];
};

type LearningPathResponse = {
  summary: {
    subjects: number;
    total_lessons: number;
    started_lessons: number;
    completed_lessons: number;
    percentage: number;
  };

  subjects: PathSubject[];
};

export const Route = createFileRoute(
  "/student/learning-path",
)({
  head: () => ({
    meta: [
      {
        title: "Learning Path — YourTeacher",
      },
      {
        name: "description",
        content:
          "Your real learning roadmap from grade to lesson completion.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: LearningPathPage,
});

function LearningPathPage() {
  const [data, setData] =
    useState<LearningPathResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadLearningPath() {
    const token = getAuthToken();

    if (!token) {
      setData(null);
      setError(
        "Your login session is unavailable.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/learning-path`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not load your learning path.",
        );
      }

      const result: LearningPathResponse =
        await response.json();

      setData(result);
    } catch (err) {
      console.error(
        "Learning Path error:",
        err,
      );

      setData(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your learning path.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLearningPath();
  }, []);

  const currentLesson = useMemo(() => {
    if (!data) {
      return null;
    }

    const lessons = data.subjects.flatMap(
      (subject) =>
        subject.units.flatMap((unit) =>
          unit.chapters.flatMap(
            (chapter) => chapter.lessons,
          ),
        ),
    );

    return (
      lessons.find(
        (lesson) =>
          lesson.is_started &&
          !lesson.is_completed,
      ) ??
      lessons.find(
        (lesson) => !lesson.is_completed,
      ) ??
      lessons.at(-1) ??
      null
    );
  }, [data]);

  const completedChapters = useMemo(() => {
    if (!data) {
      return 0;
    }

    return data.subjects.reduce(
      (subjectTotal, subject) =>
        subjectTotal +
        subject.units.reduce(
          (unitTotal, unit) =>
            unitTotal +
            unit.chapters.filter(
              (chapter) =>
                chapter.total_lessons > 0 &&
                chapter.percentage === 100,
            ).length,
          0,
        ),
      0,
    );
  }, [data]);

  const totalChapters = useMemo(() => {
    if (!data) {
      return 0;
    }

    return data.subjects.reduce(
      (subjectTotal, subject) =>
        subjectTotal +
        subject.units.reduce(
          (unitTotal, unit) =>
            unitTotal +
            unit.chapters.length,
          0,
        ),
      0,
    );
  }, [data]);

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Learning Path"
      description="Follow your real progress from grade to subject, unit, chapter and lesson."
      showNotice={false}
    >
      <StatGrid
        items={[
          {
            label: "Path completion",
            value: `${data?.summary.percentage ?? 0}%`,
            hint:
              data?.summary.percentage === 100
                ? "Completed"
                : "Based on completed lessons",
            tone: "success",
          },
          {
            label: "Chapters completed",
            value: `${completedChapters} / ${totalChapters}`,
            tone: "primary",
          },
          {
            label: "Lessons completed",
            value: `${
              data?.summary.completed_lessons ?? 0
            } / ${
              data?.summary.total_lessons ?? 0
            }`,
            hint: `${
              data?.summary.started_lessons ?? 0
            } started`,
            tone: "primary",
          },
          {
            label: "Current stage",
            value:
              currentLesson?.title ??
              "No lesson",
            hint:
              data?.summary.percentage === 100
                ? "Path completed"
                : "Next learning step",
            tone: "warning",
          },
        ]}
      />

      {loading ? (
        <section className="tile flex items-center justify-center gap-3 p-12">
          <Loader2 className="size-5 animate-spin" />

          <p className="text-sm text-muted-foreground">
            Loading your learning path...
          </p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="tile p-10 text-center">
          <MapIcon className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 font-heading text-lg font-bold">
            Learning path unavailable
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5 rounded-2xl"
            onClick={() =>
              void loadLearningPath()
            }
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </section>
      ) : null}

      {!loading &&
      !error &&
      data &&
      data.subjects.length === 0 ? (
        <section className="tile p-10 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 font-heading text-lg font-bold">
            No learning path available yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your subjects and lessons will appear
            here when learning content is available.
          </p>
        </section>
      ) : null}

      {!loading &&
      !error &&
      data &&
      data.subjects.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {data.subjects.map((subject) => (
              <section
                key={subject.id}
                className="tile overflow-hidden"
              >
                <div className="border-b border-border p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <GraduationCap className="size-6" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {subject.grade ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full"
                          >
                            {subject.grade.name}
                          </Badge>
                        ) : null}

                        {subject.code ? (
                          <Badge
                            variant="outline"
                            className="rounded-full"
                          >
                            {subject.code}
                          </Badge>
                        ) : null}
                      </div>

                      <h2 className="mt-2 font-heading text-xl font-bold">
                        {subject.name}
                      </h2>

                      <div className="mt-3 flex items-center gap-3">
                        <Progress
                          value={
                            subject.percentage
                          }
                          className="max-w-sm"
                          aria-label={`${subject.name} progress`}
                        />

                        <span className="text-sm font-semibold">
                          {subject.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  {subject.units.map(
                    (unit) => (
                      <div
                        key={unit.id}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
                            <Layers3 className="size-4" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-heading font-bold">
                                {unit.title}
                              </h3>

                              <span className="text-xs font-semibold text-muted-foreground">
                                {unit.percentage}%
                              </span>
                            </div>

                            <Progress
                              value={
                                unit.percentage
                              }
                              className="mt-2"
                              aria-label={`${unit.title} progress`}
                            />
                          </div>
                        </div>

                        <div className="space-y-3 pl-3 sm:pl-12">
                          {unit.chapters.map(
                            (chapter) => (
                              <div
                                key={
                                  chapter.id
                                }
                                className="rounded-2xl border border-border p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                      Chapter{" "}
                                      {chapter.chapter_number ??
                                        ""}
                                    </p>

                                    <h4 className="font-heading font-bold">
                                      {
                                        chapter.title
                                      }
                                    </h4>
                                  </div>

                                  <Badge
                                    variant={
                                      chapter.percentage ===
                                      100
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="rounded-full"
                                  >
                                    {
                                      chapter.completed_lessons
                                    }{" "}
                                    /{" "}
                                    {
                                      chapter.total_lessons
                                    }{" "}
                                    lessons
                                  </Badge>
                                </div>

                                <Progress
                                  value={
                                    chapter.percentage
                                  }
                                  className="mt-3"
                                  aria-label={`${chapter.title} progress`}
                                />

                                <div className="mt-4 space-y-2">
                                  {chapter.lessons.map(
                                    (
                                      lesson,
                                    ) => (
                                      <div
                                        key={
                                          lesson.id
                                        }
                                        className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3 sm:flex-row sm:items-center"
                                      >
                                        <span className="shrink-0">
                                          {lesson.is_completed ? (
                                            <CheckCircle2 className="size-5 text-success" />
                                          ) : (
                                            <Circle className="size-5 text-muted-foreground" />
                                          )}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-semibold">
                                            {
                                              lesson.title
                                            }
                                          </p>

                                          <p className="text-xs text-muted-foreground">
                                            Lesson{" "}
                                            {
                                              lesson.lesson_number
                                            }
                                            {lesson.duration
                                              ? ` · ${lesson.duration} min`
                                              : ""}
                                          </p>
                                        </div>

                                        <Badge
                                          variant="outline"
                                          className="w-fit rounded-full"
                                        >
                                          {lesson.is_completed
                                            ? "Completed"
                                            : lesson.is_started
                                              ? "In progress"
                                              : "Not started"}
                                        </Badge>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-xl"
                                          asChild
                                        >
                                          <Link
                                            to="/student/lesson/$lessonId"
                                            params={{
                                              lessonId:
                                                String(
                                                  lesson.id,
                                                ),
                                            }}
                                          >
                                            {lesson.is_completed
                                              ? "Review"
                                              : lesson.is_started
                                                ? "Resume"
                                                : "Start"}

                                            <ChevronRight className="size-4" />
                                          </Link>
                                        </Button>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>

          <StudioPanel
            title="Subject progress"
            icon={MapIcon}
            className="h-fit"
          >
            <ul className="space-y-4">
              {data.subjects.map(
                (subject) => (
                  <li
                    key={subject.id}
                    className="space-y-2"
                  >
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">
                        {subject.name}
                      </span>

                      <span className="font-semibold">
                        {subject.percentage}%
                      </span>
                    </div>

                    <Progress
                      value={
                        subject.percentage
                      }
                      aria-label={`${subject.name} progress`}
                    />

                    <p className="text-xs text-muted-foreground">
                      {
                        subject.completed_lessons
                      }{" "}
                      of {subject.total_lessons}{" "}
                      lessons completed
                    </p>
                  </li>
                ),
              )}
            </ul>
          </StudioPanel>
        </div>
      ) : null}
    </PortalPage>
  );
}