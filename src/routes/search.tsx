import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { NoResults } from "@/components/common/StateViews";
import { TablePagination } from "@/components/common/TablePagination";
import { Reveal } from "@/components/common/Reveal";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { searchFilters, searchIndex, searchKinds, type SearchKind } from "@/data/search";

const title = "Search CBSE Chapters, Videos & Worksheets | YourCBSE";
const description =
  "Search across CBSE chapters, topics, videos, worksheets, MCQs and NCERT solutions for Classes 6 to 12 in one place.";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [kind, setKind] = useState<SearchKind | "All">("All");
  const [grade, setGrade] = useState(searchFilters.grades[0]);
  const [subject, setSubject] = useState(searchFilters.subjects[0]);
  const [sort, setSort] = useState(searchFilters.sort[0]);

  const results = useMemo(() => {
    return searchIndex.filter((item) => {
      if (kind !== "All" && item.kind !== kind) return false;
      if (!grade.startsWith("All") && !item.context.includes(grade)) return false;
      if (!subject.startsWith("All") && !item.context.includes(subject)) return false;
      return true;
    });
  }, [kind, grade, subject]);

  const filtersActive =
    kind !== "All" || !grade.startsWith("All") || !subject.startsWith("All");

  function resetFilters() {
    setKind("All");
    setGrade(searchFilters.grades[0]);
    setSubject(searchFilters.subjects[0]);
    setSort(searchFilters.sort[0]);
  }

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Search" }]}
          title="Search"
          description="Find chapters, topics, videos, worksheets, MCQs and NCERT solutions across every grade."
        />

        <SearchAutocomplete size="lg" withButton className="max-w-2xl" />

        <div
          role="group"
          aria-label="Filter results by type"
          className="scroll-rail flex flex-wrap gap-1.5 rounded-2xl bg-muted p-1.5"
        >
          {(["All", ...searchKinds] as Array<SearchKind | "All">).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              onClick={() => setKind(option)}
              className={`inline-flex min-h-9 items-center rounded-xl px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                kind === option
                  ? "bg-background text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>


        <section
          aria-label="Search filters"
          className="tile flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
            Filters
          </p>
          <div className="grid flex-1 gap-2 sm:grid-cols-3">
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger aria-label="Filter by grade">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {searchFilters.grades.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger aria-label="Filter by subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {searchFilters.subjects.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger aria-label="Sort results">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {searchFilters.sort.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filtersActive ? (
            <Button variant="ghost" className="rounded-xl" onClick={resetFilters}>
              Clear all
            </Button>
          ) : null}
        </section>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing <span className="font-semibold text-foreground">{results.length}</span> placeholder
          results
        </p>

        {results.length ? (
          <>
            <ul className="grid gap-3">
              {results.slice(0, 8).map((item, index) => (
                <Reveal as="li" key={item.id} delay={index * 40}>
                  <Link
                    to="/coming-soon"
                    className="tile tile-interactive flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="space-y-1">
                      <span className="block font-heading font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="block text-sm text-muted-foreground">{item.context}</span>
                    </span>
                    <Badge variant="secondary">{item.kind}</Badge>
                  </Link>
                </Reveal>
              ))}
            </ul>
            <TablePagination />
          </>
        ) : (
          <NoResults onReset={resetFilters} />
        )}
      </PublicPageShell>
    </PublicLayout>
  );
}
