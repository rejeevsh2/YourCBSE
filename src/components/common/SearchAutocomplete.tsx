import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Clock3, Search, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  filterSuggestions,
  searchKinds,
  trendingSearches,
  type SearchKind,
  type SearchSuggestion,
} from "@/data/search";
import { cn } from "@/lib/utils";

const RECENT_KEY = "yourcbse-recent-searches";

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  size?: "sm" | "default" | "lg";
  withButton?: boolean;
  /** Show trending terms when the field is empty and focused. */
  showTrending?: boolean;
  /** Show the kind filter chips inside the suggestion panel. */
  showFilters?: boolean;
  /** Where a submitted search should open. */
  destination?: "/search" | "/student/search";
  "aria-label"?: string;
}

const kindTone: Record<SearchKind, string> = {
  Chapter: "bg-primary/10 text-primary",
  Subject: "bg-violet/10 text-violet",
  Grade: "bg-success/10 text-success",
  Topic: "bg-primary/10 text-primary",
  Video: "bg-warning/15 text-warning",
  Resource: "bg-secondary text-muted-foreground",
  Worksheet: "bg-secondary text-muted-foreground",
  MCQ: "bg-destructive/10 text-destructive",
  "NCERT Solution": "bg-success/10 text-success",
  Practice: "bg-destructive/10 text-destructive",
};

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed.filter((v) => typeof v === "string") as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Modern search field with autocomplete UI, recent + popular searches, type
 * filters and full keyboard navigation. Presentation only — no API is called.
 */
export function SearchAutocomplete({
  className,
  placeholder = "Search chapters, topics, videos, worksheets, MCQs…",
  size = "default",
  withButton = false,
  showTrending = true,
  showFilters = true,
  destination = "/search",
  ...rest
}: SearchAutocompleteProps) {
  const navigate = useNavigate();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [kind, setKind] = useState<SearchKind | "All">("All");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => setRecent(readRecent()), []);

  const suggestions = useMemo(
    () => filterSuggestions(query, 7, kind === "All" ? undefined : kind),
    [query, kind],
  );
  const trending = showTrending && !query.trim() ? trendingSearches.slice(0, 5) : [];
  const quick = query.trim() ? suggestions.map((item) => item.label) : [...recent, ...trending];

  useEffect(() => setActiveIndex(-1), [query, kind]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const remember = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setRecent((current) => {
      const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 4);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  function submit(value: string) {
    const trimmed = value.trim();

    setOpen(false);
    setQuery(trimmed);

    if (!trimmed) {
      return;
    }

    remember(trimmed);

    if (destination === "/student/search") {
      void navigate({
        to: "/student/search",
        search: {
          q: trimmed,
        },
      });
      return;
    }

    void navigate({
      to: "/search",
      search: {
        q: trimmed,
      },
    });
  }

  function clearRecent() {
    setRecent([]);
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || quick.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % quick.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? quick.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      submit(quick[activeIndex]);
    }
  }

  const heights = { sm: "h-10", default: "h-11", lg: "h-13" } as const;

  type Row = { id: string; label: string; kind: SearchKind | null; context: string };
  const rows: Row[] = query.trim()
    ? suggestions
    : [
        ...recent.map((term) => ({
          id: `recent-${term}`,
          label: term,
          kind: null,
          context: "Recent search",
        })),
        ...trending.map((term) => ({
          id: `trend-${term}`,
          label: term,
          kind: null,
          context: "Popular search",
        })),
      ];

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
        className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label={rest["aria-label"] ?? "Search YourSchool"}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className={cn("rounded-xl pr-10 pl-11", heights[size], size === "lg" && "text-base")}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {withButton ? (
          <Button type="submit" size={size === "lg" ? "lg" : "default"} className="rounded-xl">
            Search
          </Button>
        ) : null}
      </form>

      {open ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-elevated)]">
          {showFilters ? (
            <div
              role="group"
              aria-label="Filter suggestions by type"
              className="flex gap-1.5 overflow-x-auto border-b border-border p-2"
            >
              {(["All", ...searchKinds] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={kind === option}
                  onClick={() => setKind(option)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    kind === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}

          {rows.length > 0 ? (
            <>
              {!query.trim() && recent.length ? (
                <div className="flex items-center justify-between px-3 pt-2">
                  <span className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Recent searches
                  </span>
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="rounded text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    Clear
                  </button>
                </div>
              ) : null}
              <ul
                id={listId}
                role="listbox"
                aria-label="Search suggestions"
                className="max-h-80 overflow-y-auto p-1.5"
              >
                {rows.map((item, index) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={activeIndex === index}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => submit(item.label)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        activeIndex === index
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/60",
                      )}
                    >
                      {item.kind ? (
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                            kindTone[item.kind],
                          )}
                        >
                          {item.kind}
                        </span>
                      ) : item.context === "Recent search" ? (
                        <Clock3
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      ) : (
                        <TrendingUp
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        {item.context ? (
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.context}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No suggestions for “{query}”. Try a chapter, subject or grade.
            </p>
          )}

          <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
            Press <kbd className="rounded border border-border px-1">↑</kbd>{" "}
            <kbd className="rounded border border-border px-1">↓</kbd> to navigate ·{" "}
            <kbd className="rounded border border-border px-1">Enter</kbd> to open
          </p>
        </div>
      ) : null}
    </div>
  );
}

