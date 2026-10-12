import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Loader2,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAuthToken } from "@/lib/auth";

const PUBLIC_API = `${API_BASE_URL}/public`;
const AUTH_API = API_BASE_URL;

type Lesson = {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
  lesson_number: number;
  summary: string | null;
  duration: number | null;
  display_order: number | null;
  is_published: boolean;
  is_active: boolean;
};
type ChapterProgress = {
  chapter_id: number;
  total_lessons: number;
  started_lessons: number;
  completed_lessons: number;
  percentage: number;
  lessons: {
    lesson: Lesson;
    is_started: boolean;
    is_completed: boolean;
    started_at: string | null;
    last_opened_at: string | null;
    completed_at: string | null;
  }[];
};
export const Route = createFileRoute("/student/chapter/$chapterSlug")({
  head: () => ({
    meta: [
      { title: "Chapter — YourSchool" },
      {
        name: "description",
        content: "View chapter lessons and learning content.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChapterOverviewPage,
});

function ChapterOverviewPage() {
  const { chapterSlug } = Route.useParams();

  const chapterId = chapterSlug;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const [chapterProgress, setChapterProgress] =
  useState<ChapterProgress | null>(null);

  async function loadLessons() {
    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch(
        `${PUBLIC_API}/chapters/${chapterId}/lessons`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Could not load lessons.");
      }

      const data: Lesson[] = await response.json();

      setLessons(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load the lessons for this chapter.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function loadChapterProgress() {
    const token = getAuthToken();

    if (!token) {
      setChapterProgress(null);
      return;
    }

    try {
      const response = await fetch(
        `${AUTH_API}/chapters/${chapterId}/progress`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not load chapter progress.",
        );
      }

      const data: ChapterProgress =
        await response.json();

      setChapterProgress(data);
    } catch (err) {
      console.error(
        "Chapter progress error:",
        err,
      );

      setChapterProgress(null);
    }
  }

  useEffect(() => {
  void loadLessons();
  void loadChapterProgress();
}, [chapterId]);

function getLessonProgress(lessonId: number) {
  return chapterProgress?.lessons.find(
    (item) => item.lesson.id === lessonId,
  );
}

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Chapter Lessons"
      description="Choose a lesson below to start learning."
      showNotice={false}
      actions={
        <Button
          variant="outline"
          className="rounded-2xl"
          asChild
        >
          <Link to="/student/learning-hub">
            <ArrowLeft className="size-4" />
            Back to Learning Hub
          </Link>
        </Button>
      }
    >
      <div className="space-y-5">

        <section className="tile p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <BookOpen className="size-6" />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Chapter
              </p>

              <h2 className="mt-1 font-heading text-xl font-bold">
                Learning materials
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Work through the lessons in order or choose
                the lesson you want to study.
              </p>
            </div>
          </div>
         </section>

        {chapterProgress ? (
          <section className="tile p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  Chapter Progress
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {chapterProgress.completed_lessons} of{" "}
                  {chapterProgress.total_lessons} lessons completed
                </p>
              </div>

              <span className="font-heading text-2xl font-bold text-primary">
                {chapterProgress.percentage}%
              </span>
            </div>

            <Progress
              value={chapterProgress.percentage}
              className="mt-4"
            />
          </section>
        ) : null}

        {loading ? (
          <section className="tile flex items-center justify-center gap-3 p-10">
            <Loader2 className="size-5 animate-spin" />

            <p className="text-sm text-muted-foreground">
              Loading lessons...
            </p>
          </section>
        ) : null}

        {!loading && error ? (
          <section className="tile p-8 text-center">
            <p className="font-semibold text-destructive">
              {error}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-2xl"
              onClick={loadLessons}
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </section>
        ) : null}

        {!loading && !error && lessons.length === 0 ? (
          <section className="tile p-10 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-3 font-heading text-lg font-bold">
              No published lessons yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              This chapter does not currently contain any
              published lessons.
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
              Lessons must be both Active and Published in
              the Admin Portal before students can see them.
            </p>
          </section>
        ) : null}

        {!loading && !error && lessons.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-heading text-xl font-bold">
                Lessons
              </h2>

              <p className="text-sm text-muted-foreground">
                {lessons.length} lesson
                {lessons.length === 1 ? "" : "s"} available
              </p>
            </div>

            <div className="grid gap-4">
              {lessons.map((lesson, index) => (
                <article
                  key={lesson.id}
                  className="tile flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent font-heading font-bold text-accent-foreground">
                      {lesson.lesson_number ?? index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-bold">
                          {lesson.title}
                        </h3>

                       {(() => {
  const progress = getLessonProgress(lesson.id);

  if (progress?.is_completed) {
    return (
      <Badge className="rounded-full">
        <CheckCircle2 className="mr-1 size-3.5" />
        Completed
      </Badge>
    );
  }

  if (progress?.is_started) {
    return (
      <Badge
        variant="secondary"
        className="rounded-full"
      >
        In Progress
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="rounded-full"
    >
      Not Started
    </Badge>
  );
})()}
                      </div>

                      {lesson.summary ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {lesson.summary}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Open this lesson to view its learning
                          content.
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {lesson.duration ? (
                          <span className="flex items-center gap-1">
                            <Clock3 className="size-3.5" />
                            {lesson.duration} min
                          </span>
                        ) : null}

                        <span className="flex items-center gap-1">
                          <PlayCircle className="size-3.5" />
                          Lesson {lesson.lesson_number ?? index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                 {(() => {
  const progress = getLessonProgress(lesson.id);

  const buttonText = progress?.is_completed
    ? "Review"
    : progress?.is_started
      ? "Resume"
      : "Start Lesson";

  return (
    <Button
      asChild
      className="shrink-0 rounded-2xl"
    >
      <Link
        to="/student/lesson/$lessonId"
        params={{
          lessonId: String(lesson.id),
        }}
      >
        {buttonText}
        <ChevronRight className="size-4" />
      </Link>
    </Button>
  );
})()}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PortalPage>
  );
}
