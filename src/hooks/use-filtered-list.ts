import { useMemo, useState } from "react";

interface FilteredListOptions<TItem, TKind extends string> {
  items: TItem[];
  /** Field(s) matched against the search query. */
  search: (item: TItem) => string;
  /** Value compared against the selected kind chip. */
  kindOf: (item: TItem) => TKind;
}

/**
 * Shared "search box + type chips" list filtering used by the Download and
 * Bookmark centres. Keeps the filtering memoised so large lists don't
 * recompute on unrelated renders.
 */
export function useFilteredList<TItem, TKind extends string>({
  items,
  search,
  kindOf,
}: FilteredListOptions<TItem, TKind>) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<TKind | "All">("All");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (kind === "All" || kindOf(item) === kind) && search(item).toLowerCase().includes(needle),
    );
    // `search`/`kindOf` are pure selectors defined inline by callers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, kind]);

  return { query, setQuery, kind, setKind, results };
}

