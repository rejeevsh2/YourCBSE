import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ListToolbarProps<TKind extends string> {
  query: string;
  onQueryChange: (value: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  kinds: readonly TKind[];
  activeKind: TKind | "All";
  onKindChange: (kind: TKind | "All") => void;
  filterLabel: string;
  /** Announced result count, e.g. "8 of 12 files". */
  resultSummary?: string;
}

/**
 * Search field + type chips shared by the Download and Bookmark centres.
 * The chips are exposed as a toggle group so screen readers announce state.
 */
export function ListToolbar<TKind extends string>({
  query,
  onQueryChange,
  searchLabel,
  searchPlaceholder,
  kinds,
  activeKind,
  onKindChange,
  filterLabel,
  resultSummary,
}: ListToolbarProps<TKind>) {
  const options: (TKind | "All")[] = ["All", ...kinds];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="rounded-2xl pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={filterLabel}>
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={option === activeKind ? "default" : "outline"}
            className="rounded-2xl"
            aria-pressed={option === activeKind}
            onClick={() => onKindChange(option)}
          >
            {option}
          </Button>
        ))}
      </div>
      {resultSummary ? (
        <p className="sr-only" role="status" aria-live="polite">
          {resultSummary}
        </p>
      ) : null}
    </div>
  );
}
