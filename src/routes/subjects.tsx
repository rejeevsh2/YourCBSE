import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { SubjectCard } from "@/components/common/BrowseCards";
import { Reveal } from "@/components/common/Reveal";
import type { Subject } from "@/types";

const title = "CBSE Subjects — Maths, Science, English & More | YourTeacher";
const description =
  "Explore CBSE subjects by class, with chapter-wise notes, videos, worksheets and interactive practice.";



export const Route = createFileRoute("/subjects")({
  validateSearch: (search: Record<string, unknown>) => ({
    grade:
      typeof search.grade === "string" && search.grade.length > 0
        ? search.grade
        : "1",
  }),

  loaderDeps: ({ search }) => ({
    grade: search.grade,
  }),

  loader: async ({ deps }): Promise<Subject[]> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/public/grades/${deps.grade}/subjects`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to load subjects.");
    }

    return response.json();
  },

  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),

  component: SubjectsPage,
});

function SubjectsPage() {
  const subjects: Subject[] = Route.useLoaderData();
  const { grade } = Route.useSearch();

  const gradeName =
    subjects.length > 0 && subjects[0].grades.length > 0
      ? subjects[0].grades[0]
      : `Class ${grade}`;

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Grades", to: "/grades" },
            { label: gradeName },
          ]}
          title={`${gradeName} subjects`}
          description="Choose a subject to explore its chapters and learning resources."
        />

        <SearchAutocomplete
          className="max-w-lg"
          placeholder="Search a subject…"
        />

        {subjects.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, index) => (
              <Reveal as="li" key={subject.id} delay={index * 50}>
                <SubjectCard subject={subject} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="panel p-6 text-sm text-muted-foreground">
            No subjects are available for this class yet.
          </div>
        )}
      </PublicPageShell>
    </PublicLayout>
  );
}
