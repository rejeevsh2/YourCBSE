import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { GradeCard } from "@/components/common/BrowseCards";
import { Reveal } from "@/components/common/Reveal";
import type { Grade } from "@/types";

const title = "CBSE Grades — Class 1 to Class 12 | YourSchool";
const description =
  "Browse the full CBSE syllabus by grade, with subjects, chapters and learning resources for each class.";



export const Route = createFileRoute("/grades")({
  ssr: false,
  loader: async (): Promise<Grade[]> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/public/boards/1/grades`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to load grades.");
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

  component: GradesPage,
});

function GradesPage() {
  const grades: Grade[] = Route.useLoaderData();

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Grades" }]}
          title="Browse by grade"
          description="Pick your class to see its subjects, chapters and resources."
        />

        <SearchAutocomplete
          className="max-w-lg"
          placeholder="Search a grade…"
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grades.map((grade, index) => (
            <Reveal as="li" key={grade.id} delay={index * 50}>
              <GradeCard grade={grade} />
            </Reveal>
          ))}
        </ul>
      </PublicPageShell>
    </PublicLayout>
  );
}
