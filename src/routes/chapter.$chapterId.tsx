import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
  lesson_number: number;
  summary: string | null;
  duration: number | null;
  display_order: number;
  is_published: boolean;
  is_active: boolean;
}



export const Route = createFileRoute("/chapter/$chapterId")({
  ssr: false,
  loader: async ({ params }): Promise<Lesson[]> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/public/chapters/${params.chapterId}/lessons`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to load lessons.");
    }

    return response.json();
  },

  component: ChapterPage,
});

function ChapterPage() {
  const lessons: Lesson[] = Route.useLoaderData();

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Grades", to: "/grades" },
            { label: "Subjects", to: "/subjects" },
            { label: "Lessons" },
          ]}
          title="Lessons"
          description="Choose a lesson to start learning."
        />

        {lessons.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <article className="panel panel-interactive group flex h-full flex-col gap-4 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <BookOpen className="size-5" aria-hidden="true" />
                    </span>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Lesson {lesson.lesson_number}
                      </p>

                      <h2 className="font-heading text-lg font-semibold text-foreground">
                        {lesson.title}
                      </h2>
                    </div>
                  </div>

                  {lesson.summary ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {lesson.summary}
                    </p>
                  ) : null}

                  {lesson.duration ? (
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4 text-primary" />
                        <span>{lesson.duration} minutes</span>
                      </div>
                    </div>
                  ) : null}

                  <Button
                    asChild
                    variant="outline"
                    className="mt-auto w-full rounded-xl"
                  >
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: String(lesson.id) }}
                    >
                      Start Lesson
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="panel p-6 text-sm text-muted-foreground">
            No lessons are available for this chapter yet.
          </div>
        )}
      </PublicPageShell>
    </PublicLayout>
  );
}
