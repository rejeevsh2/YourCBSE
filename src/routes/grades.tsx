import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { GradeCard } from "@/components/common/BrowseCards";
import { Reveal } from "@/components/common/Reveal";
import { grades } from "@/data/placeholder";


const title = "CBSE Grades — Class 6 to Class 12 | YourCBSE";
const description =
  "Browse the full CBSE syllabus by grade, from Class 6 to Class 12, with subject and chapter counts for each level.";

export const Route = createFileRoute("/grades")({
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
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Grades" }]}
          title="Browse by grade"
          description="Pick your class to see its subjects, chapters and resources."
        />
        <SearchAutocomplete className="max-w-lg" placeholder="Search a grade…" />

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
