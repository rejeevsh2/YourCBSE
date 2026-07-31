import { useCallback, useEffect, useMemo, useState } from "react";
import type { LibraryResource } from "@/data/resource-center";
import {
  emptyQuery,
  resourceCenterService,
  type ResourceQuery,
  type SearchSuggestionItem,
} from "@/lib/resource-center";

const RECENT_KEY = "yourcbse.library.recent-searches";
const MAX_RECENT = 6;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as string[]).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

/** Persisted recent search terms, shared by the palette and the search page. */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => setRecent(readRecent()), []);

  const remember = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((current) => {
      const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, MAX_RECENT);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep in memory only */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { recent, remember, clear };
}

/** Debounced suggestions for the search palette / autocomplete input. */
export function useSearchSuggestions(term: string, limit = 8) {
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!term.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void resourceCenterService.suggest(term, limit).then((result) => {
        if (cancelled) return;
        setSuggestions(result.ok ? result.data : []);
        setLoading(false);
      });
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [term, limit]);

  return { suggestions, loading };
}

export interface UseResourceSearchOptions {
  initial?: Partial<ResourceQuery>;
  bookmarks?: string[];
}

/** Query state + async results for the search page. */
export function useResourceSearch({ initial, bookmarks = [] }: UseResourceSearchOptions = {}) {
  const [query, setQuery] = useState<ResourceQuery>({ ...emptyQuery, ...initial });
  const [results, setResults] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookmarkKey = bookmarks.join(",");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const handle = window.setTimeout(() => {
      void resourceCenterService.search(query, bookmarkKey ? bookmarkKey.split(",") : []).then(
        (result) => {
          if (cancelled) return;
          if (result.ok) {
            setResults(result.data);
          } else {
            setError(result.message);
          }
          setLoading(false);
        },
      );
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query, bookmarkKey]);

  const update = useCallback(<TKey extends keyof ResourceQuery>(key: TKey, value: ResourceQuery[TKey]) => {
    setQuery((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleValue = useCallback(
    <TKey extends keyof ResourceQuery>(key: TKey, value: string) => {
      setQuery((current) => {
        const list = current[key] as unknown as string[];
        const next = list.includes(value)
          ? list.filter((item) => item !== value)
          : [...list, value];
        return { ...current, [key]: next } as ResourceQuery;
      });
    },
    [],
  );

  const reset = useCallback(() => setQuery({ ...emptyQuery }), []);

  const activeFilterCount = useMemo(() => {
    const lists: (keyof ResourceQuery)[] = [
      "grades",
      "subjects",
      "chapters",
      "categories",
      "kinds",
      "difficulties",
      "languages",
      "statuses",
    ];
    const listCount = lists.reduce(
      (total, key) => total + (query[key] as unknown as string[]).length,
      0,
    );
    return (
      listCount +
      (query.maxDuration ? 1 : 0) +
      (query.recentlyAdded ? 1 : 0) +
      (query.bookmarkedOnly ? 1 : 0)
    );
  }, [query]);

  return { query, results, loading, error, update, toggleValue, reset, activeFilterCount, setQuery };
}
