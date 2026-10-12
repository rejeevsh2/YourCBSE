import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  GraduationCap,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAuthToken } from "@/lib/auth";

const API = API_BASE_URL;

type Course = {
  id: number;
  name: string;
  code: string | null;
  icon: string | null;
  color: string | null;

  grade: {
    id: number;
    name: string;
  } | null;

  total_chapters: number;
  completed_chapters: number;

  total_lessons: number;
  started_lessons: number;
  completed_lessons: number;

  percentage: number;

  next_lesson: {
    id: number;
    title: string;
    lesson_number: number;
    chapter_id: number;
  } | null;
};

type CoursesResponse = {
  courses: Course[];
  count: number;
};

export const Route = createFileRoute("/student/courses")({
  head: () => ({
    meta: [
      { title: "My Courses — YourTeacher" },
      {
        name: "description",
        content:
          "Track your real learning progress across subjects.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    const token = getAuthToken();

    if (!token) {
      setCourses([]);
      setError("Your login session is unavailable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/my-courses`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          "Could not load your courses.",
        );
      }

      const data: CoursesResponse =
        await response.json();

      setCourses(data.courses ?? []);
    } catch (err) {
      console.error("My Courses error:", err);

      setCourses([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your courses.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  const totals = useMemo(() => {
    const chapters = courses.reduce(
      (sum, course) =>
        sum + course.total_chapters,
      0,
    );

    const completedChapters = courses.reduce(
      (sum, course) =>
        sum + course.completed_chapters,
      0,
    );

    const lessons = courses.reduce(
      (sum, course) =>
        sum + course.total_lessons,
      0,
    );

    const completedLessons = courses.reduce(
      (sum, course) =>
        sum + course.completed_lessons,
      0,
    );

    const overall =
      lessons > 0
        ? Math.round(
            (completedLessons / lessons) * 100,
          )
        : 0;

    return {
      chapters,
      completedChapters,
      lessons,
      completedLessons,
      overall,
    };
  }, [courses]);

  const gradeLabel = useMemo(() => {
    const grades = [
      ...new Set(
        courses
          .map((course) => course.grade?.name)
          .filter(
            (name): name is string =>
              Boolean(name),
          ),
      ),
    ];

    if (grades.length === 0) {
      return "Your curriculum";
    }

    return grades.join(", ");
  }, [courses]);

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="My Courses"
      description="Track your subjects and continue from where you stopped."
      showNotice={false}
      actions={
        <Button
          className="rounded-2xl"
          asChild
        >
          <Link to="/student/learning-hub">
            <BookOpenCheck className="size-4" />
            Browse Learning Hub
          </Link>
        </Button>
      }
    >
      <StatGrid
        items={[
          {
            label: "Subjects",
            value: String(courses.length),
            hint: gradeLabel,
          },
          {
            label: "Chapters completed",
            value: `${totals.completedChapters} / ${totals.chapters}`,
            hint: "Across all subjects",
            tone: "success",
          },
          {
            label: "Lessons completed",
            value: `${totals.completedLessons} / ${totals.lessons}`,
            hint: "Published lessons",
            tone: "primary",
          },
          {
            label: "Overall progress",
            value: `${totals.overall}%`,
            hint: "Based on completed lessons",
            tone: "warning",
          },
        ]}
      />

      {loading ? (
        <section className="tile flex items-center justify-center gap-3 p-12">
          <Loader2 className="size-5 animate-spin" />

          <p className="text-sm text-muted-foreground">
            Loading your courses...
          </p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="tile p-10 text-center">
          <GraduationCap className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 font-heading text-lg font-bold">
            Courses unavailable
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5 rounded-2xl"
            onClick={() => void loadCourses()}
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </section>
      ) : null}

      {!loading &&
      !error &&
      courses.length === 0 ? (
        <section className="tile p-10 text-center">
          <BookOpenCheck className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 font-heading text-lg font-bold">
            No courses available yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your active subjects will appear here when
            course content is available.
          </p>

          <Button
            className="mt-5 rounded-2xl"
            asChild
          >
            <Link to="/student/learning-hub">
              <BookOpenCheck className="size-4" />
              Browse Learning Hub
            </Link>
          </Button>
        </section>
      ) : null}

      {!loading &&
      !error &&
      courses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <article
              key={course.id}
              className="tile tile-interactive space-y-4 p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Calculator
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-base font-bold">
                    {course.name}
                  </h2>

                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <GraduationCap
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    {course.grade?.name ??
                      "Curriculum"}
                  </p>
                </div>

                <span className="font-heading text-lg font-bold">
                  {course.percentage}%
                </span>
              </div>

              <Progress
                value={course.percentage}
                aria-label={`${course.name} progress`}
              />

              <dl className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <dt>Chapters</dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {course.completed_chapters} /{" "}
                    {course.total_chapters}
                  </dd>
                </div>

                <div>
                  <dt>Lessons</dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {course.completed_lessons} /{" "}
                    {course.total_lessons}
                  </dd>
                </div>
              </dl>

              <p className="text-sm">
                <span className="text-muted-foreground">
                  Up next:{" "}
                </span>

                {course.next_lesson
                  ? course.next_lesson.title
                  : course.total_lessons > 0
                    ? "Course completed"
                    : "No lessons available"}
              </p>

              {course.next_lesson ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-2xl"
                >
                  <Link
                    to="/student/lesson/$lessonId"
                    params={{
                      lessonId: String(
                        course.next_lesson.id,
                      ),
                    }}
                  >
                    Continue subject
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-2xl"
                >
                  <Link to="/student/learning-hub">
                    Open subject
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </PortalPage>
  );
}