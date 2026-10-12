import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

interface Unit {
  id: number;
  subject_id: number;
  title: string;
  code: string;
  unit_number: number;
  description: string | null;
  display_order: number;
  is_active: boolean;
}



export const Route = createFileRoute("/subject/$subjectId")({
  loader: async ({ params }): Promise<Unit[]> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/public/subjects/${params.subjectId}/units`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to load subject units.");
    }

    return response.json();
  },

  component: SubjectPage,
});

function SubjectPage() {
  const units: Unit[] = Route.useLoaderData();

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Grades", to: "/grades" },
            { label: "Subjects", to: "/subjects" },
            { label: "Subject" },
          ]}
          title="Subject units"
          description="Choose a unit to explore its chapters and learning resources."
        />

        {units.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <li key={unit.id}>
                <article className="panel panel-interactive group flex h-full flex-col gap-4 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Layers className="size-5" aria-hidden="true" />
                    </span>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Unit {unit.unit_number}
                      </p>

                      <h2 className="font-heading text-lg font-semibold text-foreground">
                        {unit.title}
                      </h2>
                    </div>
                  </div>

                  {unit.description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {unit.description}
                    </p>
                  ) : null}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="size-4 text-primary" />
                      <span>{unit.code}</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="mt-auto w-full rounded-xl"
                  >
                    <Link
                      to="/unit/$unitId"
                      params={{ unitId: String(unit.id) }}
                    >
                      Explore {unit.title}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="panel p-6 text-sm text-muted-foreground">
            No units are available for this subject yet.
          </div>
        )}
      </PublicPageShell>
    </PublicLayout>
  );
}
