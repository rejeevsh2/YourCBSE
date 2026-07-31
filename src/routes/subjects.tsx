import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { SubjectCard } from "@/components/common/BrowseCards";
import { Reveal } from "@/components/common/Reveal";
import { subjects } from "@/data/placeholder";


const title = "CBSE Subjects — Maths, Science, English & More | YourCBSE";
const description =
  "Explore CBSE subjects across Classes 6 to 12, with chapter-wise notes, videos, worksheets and interactive practice.";

export const Route = createFileRoute("/subjects")({
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
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Subjects" }]}
          title="Browse by subject"
          description="Each subject is organised chapter by chapter across the grades it covers."
        />
        <SearchAutocomplete className="max-w-lg" placeholder="Search a subject…" />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, index) => (
            <Reveal as="li" key={subject.id} delay={index * 50}>
              <SubjectCard subject={subject} />
            </Reveal>
          ))}
        </ul>

      </PublicPageShell>
    </PublicLayout>
  );
}
