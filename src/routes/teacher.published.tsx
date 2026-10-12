import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiRequest } from "@/lib/auth/http";

type LessonContent = {
  id: number;
  title: string;
  content_type: string;
};

type Chapter = {
  id: number;
  title: string;
};

type Lesson = {
  id: number;
  title: string;
  summary?: string | null;
  duration?: number | null;
  is_published: boolean;
  chapter?: Chapter | null;
  contents?: LessonContent[];
};

type LessonResponse = {
  lessons: Lesson[];
};

export const Route = createFileRoute(
  "/teacher/published",
)({
  component: TeacherPublishedPage,
});

function TeacherPublishedPage() {
  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const result =
        await apiRequest<LessonResponse>(
          "/teacher/lessons",
          {
            method: "GET",
          },
        );

      if (cancelled) {
        return;
      }

      if (
        result.ok &&
        result.data
      ) {
        setLessons(
          result.data.lessons,
        );
      } else {
        setError(
          result.message ??
            "Unable to load published lessons.",
        );
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const publishedLessons =
    useMemo(
      () =>
        lessons.filter(
          (lesson) =>
            lesson.is_published,
        ),
      [lessons],
    );

  return (
    <PortalPage
      portalLabel="Teacher"
      portalPath="/teacher"
      title="Published Content"
      description="View lessons that have been published by an administrator."
      showNotice={false}
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading published lessons...
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : publishedLessons.length ===
        0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <CheckCircle2 className="size-8 text-muted-foreground" />

            <div>
              <p className="font-medium">
                No published lessons yet
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                When an administrator publishes one of your draft lessons,
                it will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {publishedLessons.map(
            (lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="size-5" />
                        {lesson.title}
                      </CardTitle>

                      {lesson.chapter && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {
                            lesson.chapter
                              .title
                          }
                        </p>
                      )}
                    </div>

                    <Badge>
                      Published
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {lesson.summary && (
                    <p className="text-sm text-muted-foreground">
                      {lesson.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {
                        lesson.contents
                          ?.length ?? 0
                      }{" "}
                      content items
                    </Badge>

                    {lesson.duration && (
                      <Badge variant="outline">
                        {lesson.duration} min
                      </Badge>
                    )}
                  </div>

                  {(lesson.contents
                    ?.length ?? 0) >
                    0 && (
                    <div className="space-y-2 border-t pt-3">
                      {lesson.contents?.map(
                        (content) => (
                          <div
                            key={
                              content.id
                            }
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span>
                              {
                                content.title
                              }
                            </span>

                            <Badge variant="secondary">
                              {
                                content.content_type
                              }
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Published lessons are read-only for teachers.
                  </p>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </PortalPage>
  );
}