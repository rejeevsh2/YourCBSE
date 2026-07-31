import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Flame, Search, X } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { QuickActions } from "@/components/student/QuickActions";
import { NoResults } from "@/components/common/StateViews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  popularSearches,
  searchKindIcons,
  searchKinds,
  studentSearchResults,
  type SearchKind,
} from "@/data/student-library";

export const Route = createFileRoute("/student/search")({
  head: () => ({
    meta: [
      { title: "Search — YourCBSE" },
      { name: "description", content: "Search lessons, videos, notes, questions and more." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentSearchPage,
});

const recentSearches = ["Euclid's lemma", "Mirror formula", "Polynomials worksheet", "Life Processes"];

function StudentSearchPage() {
  const [query, setQuery] = useState("");
  const [kinds, setKinds] = useState<SearchKind[]>([]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return studentSearchResults.filter((item) => {
      if (kinds.length && !kinds.includes(item.kind)) return false;
      if (!term) return true;
      return `${item.title} ${item.subject} ${item.kind}`.toLowerCase().includes(term);
    });
  }, [query, kinds]);

  const toggleKind = (kind: SearchKind) =>
    setKinds((current) =>
      current.includes(kind) ? current.filter((value) => value !== kind) : [...current, kind],
    );

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Search everything"
      description="Lessons, videos, notes, questions, flashcards, mind maps, worksheets and interactive lessons."
    >
      <section className="tile space-y-4 p-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="student-search">What are you looking for?</Label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="student-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lessons, notes, questions…"
              className="rounded-2xl pl-9"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                className="absolute top-1/2 right-1 -translate-y-1/2 rounded-2xl"
                onClick={() => setQuery("")}
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <ul className="flex flex-wrap gap-2" aria-label="Filter by type">
          {searchKinds.map((kind) => {
            const active = kinds.includes(kind);
            return (
              <li key={kind}>
                <Button
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  aria-pressed={active}
                  className="rounded-2xl"
                  onClick={() => toggleKind(kind)}
                >
                  {kind}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2" aria-label="Search results">
          <h2 className="font-heading text-lg font-bold">
            {query ? `Results for “${query}”` : "Suggested for you"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">{results.length}</span>
          </h2>
          {results.length ? (
            <ul className="space-y-2">
              {results.map((item) => {
                const Icon = searchKindIcons[item.kind];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="tile tile-interactive flex w-full items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.subject} · {item.meta}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 rounded-full text-[11px]">
                        {item.kind}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <NoResults
              onReset={() => {
                setQuery("");
                setKinds([]);
              }}
            />
          )}
        </section>

        <div className="space-y-4">
          <SearchList title="Recent searches" icon={Clock3} items={recentSearches} onPick={setQuery} />
          <SearchList title="Popular searches" icon={Flame} items={popularSearches} onPick={setQuery} />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold">Quick actions</h2>
        <QuickActions />
      </section>
    </PortalPage>
  );
}

function SearchList({
  title,
  icon: Icon,
  items,
  onPick,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  onPick: (value: string) => void;
}) {
  return (
    <section className="tile space-y-3 p-5">
      <h3 className="flex items-center gap-2 font-heading text-sm font-bold">
        <Icon className="size-4 text-primary" /> {title}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => onPick(item)}
              className={cn(
                "rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              )}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
