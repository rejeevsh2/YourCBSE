import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  FileStack,
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
  content_type: string;
};

type Chapter = {
  id: number;
  title: string;
};

type Lesson = {
  id: number;
  title: string;
  is_published: boolean;
  chapter?: Chapter | null;
  contents?: LessonContent[];
};

type LessonResponse = {
  lessons: Lesson[];
};

export const Route = createFileRoute("/teacher/analytics")({
  component: TeacherAnalyticsPage,
});

function TeacherAnalyticsPage() {
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
            "Unable to load teacher analytics.",
        );
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const analytics =
    useMemo(() => {
      const published =
        lessons.filter(
          (lesson) =>
            lesson.is_published,
        ).length;

      const drafts =
        lessons.length -
        published;

      const contentCount =
        lessons.reduce(
          (total, lesson) =>
            total +
            (lesson.contents
              ?.length ?? 0),
          0,
        );

      const averageContent =
        lessons.length === 0
          ? 0
          : Math.round(
              (contentCount /
                lessons.length) *
                10,
            ) / 10;

      const contentTypes =
        new Map<string, number>();

      const chapters =
        new Map<
          number,
          {
            id: number;
            title: string;
            lessons: number;
            content: number;
          }
        >();

      for (const lesson of lessons) {
        for (
          const item of
          lesson.contents ?? []
        ) {
          const type =
            item.content_type ||
            "other";

          contentTypes.set(
            type,
            (contentTypes.get(type) ??
              0) + 1,
          );
        }

        if (lesson.chapter?.id) {
          const existing =
            chapters.get(
              lesson.chapter.id,
            ) ?? {
              id: lesson.chapter.id,
              title:
                lesson.chapter.title,
              lessons: 0,
              content: 0,
            };

          existing.lessons += 1;

          existing.content +=
            lesson.contents
              ?.length ?? 0;

          chapters.set(
            lesson.chapter.id,
            existing,
          );
        }
      }

      return {
        totalLessons:
          lessons.length,
        published,
        drafts,
        contentCount,
        averageContent,
        contentTypes:
          Array.from(
            contentTypes.entries(),
          )
            .map(
              ([type, count]) => ({
                type,
                count,
              }),
            )
            .sort(
              (a, b) =>
                b.count -
                a.count,
            ),
        chapters:
          Array.from(
            chapters.values(),
          )
            .sort(
              (a, b) =>
                b.lessons -
                  a.lessons ||
                b.content -
                  a.content,
            )
            .slice(0, 8),
      };
    }, [lessons]);

  return (
    <PortalPage
      portalLabel="Teacher"
      portalPath="/teacher"
      title="Analytics"
      description="Real statistics from the lessons and learning content you have created."
      showNotice={false}
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading analytics...
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Lessons"
              value={
                analytics.totalLessons
              }
              icon={BookOpen}
            />

            <StatCard
              title="Published"
              value={
                analytics.published
              }
              icon={BadgeCheck}
            />

            <StatCard
              title="Drafts"
              value={
                analytics.drafts
              }
              icon={FileStack}
            />

            <StatCard
              title="Content items"
              value={
                analytics.contentCount
              }
              icon={BarChart3}
            />

            <StatCard
              title="Avg. content / lesson"
              value={
                analytics.averageContent
              }
              icon={BarChart3}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Content types
                </CardTitle>
              </CardHeader>

              <CardContent>
                {analytics
                  .contentTypes
                  .length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No lesson content has been added yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.contentTypes.map(
                      (item) => (
                        <div
                          key={
                            item.type
                          }
                          className="flex items-center justify-between gap-3 rounded-xl border p-3"
                        >
                          <span className="capitalize">
                            {item.type.replace(
                              /[-_]/g,
                              " ",
                            )}
                          </span>

                          <Badge variant="secondary">
                            {
                              item.count
                            }
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Chapter coverage
                </CardTitle>
              </CardHeader>

              <CardContent>
                {analytics.chapters
                  .length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No chapter-linked lessons were found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.chapters.map(
                      (
                        chapter,
                        index,
                      ) => (
                        <div
                          key={
                            chapter.id
                          }
                          className="flex items-center justify-between gap-4 rounded-xl border p-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium">
                              {index +
                                1}
                              .{" "}
                              {
                                chapter.title
                              }
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {
                                chapter.content
                              }{" "}
                              content items
                            </p>
                          </div>

                          <Badge variant="outline">
                            {
                              chapter.lessons
                            }{" "}
                            {chapter.lessons ===
                            1
                              ? "lesson"
                              : "lessons"}
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PortalPage>
  );
}

type IconType = React.ComponentType<{
  className?: string;
}>;

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: IconType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>
        </div>

        <Icon className="size-6 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}