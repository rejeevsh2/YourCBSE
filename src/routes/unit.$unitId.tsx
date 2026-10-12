import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

interface Chapter {
  id: number;
  unit_id: number;
  title: string;
  code: string;
  chapter_number: number;
  description: string | null;
  display_order: number;
  is_active: boolean;
}



export const Route = createFileRoute("/unit/$unitId")({
  loader: async ({ params }): Promise<Chapter[]> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/public/units/${params.unitId}/chapters`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to load chapters.");
    }

    return response.json();
  },

  component: UnitPage,
});

function UnitPage() {
  const chapters: Chapter[] = Route.useLoaderData();

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Grades", to: "/grades" },
            { label: "Subjects", to: "/subjects" },
            { label: "Chapters" },
          ]}
          title="Chapters"
          description="Choose a chapter to start learning."
        />

        {chapters.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <article className="panel panel-interactive group flex h-full flex-col gap-4 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <BookOpen className="size-5" aria-hidden="true" />
                    </span>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Chapter {chapter.chapter_number}
                      </p>

                      <h2 className="font-heading text-lg font-semibold text-foreground">
                        {chapter.title}
                      </h2>
                    </div>
                  </div>

                  {chapter.description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {chapter.description}
                    </p>
                  ) : null}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Layers className="size-4 text-primary" />
                      <span>{chapter.code}</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="mt-auto w-full rounded-xl"
                  >
                    <Link
                      to="/chapter/$chapterId"
                      params={{ chapterId: String(chapter.id) }}
                    >
                      Start Chapter
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="panel p-6 text-sm text-muted-foreground">
            No chapters are available for this unit yet.
          </div>
        )}
      </PublicPageShell>
    </PublicLayout>
  );
}
