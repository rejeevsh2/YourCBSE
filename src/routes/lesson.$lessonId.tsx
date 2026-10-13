import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Clock } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";

interface LessonContent {
  id: number;
  lesson_id: number;
  title: string;
  content_type: string;
  content: string | null;
  file_path: string | null;
  external_url: string | null;
  display_order: number;
  is_free: boolean;
  is_active: boolean;
}

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
  contents: LessonContent[];
}



export const Route = createFileRoute("/lesson/$lessonId")({
  ssr: false,
  loader: async ({ params }): Promise<Lesson> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/public/lessons/${params.lessonId}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to load lesson.");
    }

    return response.json();
  },

  component: LessonPage,
});

function LessonPage() {
  const lesson: Lesson = Route.useLoaderData();

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Grades", to: "/grades" },
            { label: "Subjects", to: "/subjects" },
            { label: lesson.title },
          ]}
          title={lesson.title}
          description={lesson.summary ?? "Start learning this lesson."}
        />

        {lesson.duration ? (
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 text-primary" />
            <span>{lesson.duration} minutes</span>
          </div>
        ) : null}

        <div className="space-y-5">
          {lesson.contents.map((item) => (
            <article
              key={item.id}
              className="panel p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" aria-hidden="true" />
                </span>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.content_type}
                  </p>

                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    {item.title}
                  </h2>
                </div>
              </div>

              {item.content ? (
                <div className="whitespace-pre-wrap text-base leading-7 text-foreground">
                  {item.content}
                </div>
              ) : null}

              {item.external_url ? (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block font-medium text-primary hover:underline"
                >
                  Open resource
                </a>
              ) : null}
            </article>
          ))}

          {lesson.contents.length === 0 ? (
            <div className="panel p-6 text-muted-foreground">
              No learning content has been added to this lesson yet.
            </div>
          ) : null}
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
