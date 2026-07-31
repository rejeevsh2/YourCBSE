import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Search, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ResourceFilterPanel,
  ResourceFilterSheet,
} from "@/components/resource-center/ResourceFilters";
import { ResourceGrid } from "@/components/resource-center/ResourceGrid";
import { NoSearchResults, SearchFailed } from "@/components/resource-center/LibraryStates";
import { popularChapters, trendingSearchTerms } from "@/data/resource-center";
import { useResourceLibrary } from "@/hooks/use-resource-library";
import { useRecentSearches, useResourceSearch } from "@/hooks/use-resource-search";

const title = "Search CBSE Resources | YourCBSE Resource Center";
const description =
  "Search chapters, lessons, videos, notes, worksheets, flash cards, mind maps, MCQs and NCERT solutions, then filter by grade, subject, difficulty and more.";

export const Route = createFileRoute("/library/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibrarySearchPage,
});

function LibrarySearchPage() {
  const { q } = Route.useSearch();
  const library = useResourceLibrary();
  const { recent, remember } = useRecentSearches();
  const [term, setTerm] = useState(q);
  const search = useResourceSearch({ initial: { term: q }, bookmarks: library.bookmarks });

  useEffect(() => {
    setTerm(q);
    search.update("term", q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function submit(value: string) {
    setTerm(value);
    search.update("term", value);
    remember(value);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Resource Center", to: "/library" },
          { label: "Search" },
        ]}
        title="Search the library"
        description="Grades, subjects, chapters, lessons, videos, notes, worksheets, flash cards, mind maps, question banks, MCQs, interactive lessons and NCERT solutions."
      />

      <form
        role="search"
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          submit(term);
        }}
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            aria-label="Search resources"
            placeholder="Try “Real Numbers worksheet” or “Class 12 integrals video”"
            className="h-12 rounded-2xl pl-9"
          />
        </div>
        <Button type="submit" className="h-12 rounded-2xl px-6">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <TrendingUp className="size-3.5" aria-hidden="true" /> Trending
        </span>
        {trendingSearchTerms.map((item) => (
          <Button
            key={item}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => submit(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      {recent.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" /> Recent
          </span>
          {recent.map((item) => (
            <Button
              key={item}
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => submit(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="tile sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
            <ResourceFilterPanel
              query={search.query}
              activeFilterCount={search.activeFilterCount}
              onToggle={search.toggleValue}
              onUpdate={search.update}
              onReset={search.reset}
            />
          </div>
        </aside>

        <section className="space-y-4" aria-label="Search results">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {search.loading
                ? "Searching…"
                : `${search.results.length} resource${search.results.length === 1 ? "" : "s"} found`}
            </p>
            <ResourceFilterSheet
              query={search.query}
              activeFilterCount={search.activeFilterCount}
              onToggle={search.toggleValue}
              onUpdate={search.update}
              onReset={search.reset}
            />
          </div>

          {search.error ? (
            <SearchFailed
              message={search.error}
              onRetry={() => search.update("term", search.query.term)}
            />
          ) : (
            <ResourceGrid
              label="Search results"
              resources={search.results.slice(0, 24)}
              library={library}
              loading={search.loading}
              emptyState={<NoSearchResults query={search.query.term} onReset={search.reset} />}
            />
          )}

          {!search.loading && !search.error && !search.results.length ? (
            <section aria-label="Popular chapters" className="space-y-2">
              <h2 className="font-heading text-sm font-bold text-foreground">Popular chapters</h2>
              <ul className="flex flex-wrap gap-2">
                {popularChapters.map((item) => (
                  <li key={item.id}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => submit(item.chapter)}
                    >
                      {item.chapter}
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </section>
      </div>
    </div>
  );
}
