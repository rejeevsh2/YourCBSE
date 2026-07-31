import { SlidersHorizontal, X } from "lucide-react";
import {
  libraryGrades,
  librarySubjects,
  libraryChapterNames,
  resourceCategories,
  searchEntityKinds,
} from "@/data/resource-center";
import { sortOptions, type ResourceQuery, type SortOption } from "@/lib/resource-center";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ChipGroupProps {
  legend: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}

/** Multi-select chips with correct pressed semantics for screen readers. */
export function FilterChipGroup({ legend, options, selected, onToggle }: ChipGroupProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {legend}
      </legend>
      <ul className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <li key={option}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(option)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export interface ResourceFiltersProps {
  query: ResourceQuery;
  activeFilterCount: number;
  onToggle: <TKey extends keyof ResourceQuery>(key: TKey, value: string) => void;
  onUpdate: <TKey extends keyof ResourceQuery>(key: TKey, value: ResourceQuery[TKey]) => void;
  onReset: () => void;
}

/** Full filter panel — rendered inline on desktop, inside a sheet on mobile. */
export function ResourceFilterPanel({
  query,
  activeFilterCount,
  onToggle,
  onUpdate,
  onReset,
}: ResourceFiltersProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
          Filters
          {activeFilterCount ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {activeFilterCount}
            </span>
          ) : null}
        </p>
        {activeFilterCount ? (
          <Button variant="ghost" size="sm" className="rounded-xl" onClick={onReset}>
            <X className="size-3.5" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="library-sort" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sort by
        </Label>
        <Select value={query.sort} onValueChange={(value) => onUpdate("sort", value as SortOption)}>
          <SelectTrigger id="library-sort" className="rounded-2xl">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FilterChipGroup
        legend="Grade"
        options={libraryGrades}
        selected={query.grades}
        onToggle={(value) => onToggle("grades", value)}
      />
      <FilterChipGroup
        legend="Subject"
        options={librarySubjects}
        selected={query.subjects}
        onToggle={(value) => onToggle("subjects", value)}
      />
      <FilterChipGroup
        legend="Chapter"
        options={libraryChapterNames}
        selected={query.chapters}
        onToggle={(value) => onToggle("chapters", value)}
      />
      <FilterChipGroup
        legend="Resource type"
        options={resourceCategories}
        selected={query.categories}
        onToggle={(value) => onToggle("categories", value)}
      />
      <FilterChipGroup
        legend="Content kind"
        options={searchEntityKinds}
        selected={query.kinds}
        onToggle={(value) => onToggle("kinds", value)}
      />
      <FilterChipGroup
        legend="Difficulty"
        options={["Easy", "Medium", "Hard"]}
        selected={query.difficulties}
        onToggle={(value) => onToggle("difficulties", value)}
      />
      <FilterChipGroup
        legend="Language"
        options={["English", "Hindi", "Bilingual"]}
        selected={query.languages}
        onToggle={(value) => onToggle("languages", value)}
      />
      <FilterChipGroup
        legend="Progress"
        options={["Completed", "In progress", "Not started"]}
        selected={query.statuses}
        onToggle={(value) => onToggle("statuses", value)}
      />

      <div className="space-y-2">
        <Label htmlFor="library-duration" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Duration {query.maxDuration ? `— up to ${query.maxDuration} min` : "— any"}
        </Label>
        <Slider
          id="library-duration"
          min={0}
          max={60}
          step={5}
          value={[query.maxDuration]}
          onValueChange={([value]) => onUpdate("maxDuration", value)}
          aria-label="Maximum duration in minutes"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-border p-3">
        <ToggleRow
          id="filter-recent"
          label="Recently added"
          description="Published in the last 14 days"
          checked={query.recentlyAdded}
          onChange={(value) => onUpdate("recentlyAdded", value)}
        />
        <ToggleRow
          id="filter-bookmarked"
          label="Bookmarked only"
          description="Show items saved to favourites"
          checked={query.bookmarkedOnly}
          onChange={(value) => onUpdate("bookmarkedOnly", value)}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/** Mobile entry point for the same panel. */
export function ResourceFilterSheet(props: ResourceFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-2xl lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {props.activeFilterCount ? (
            <span className="ml-1 rounded-full bg-primary/15 px-2 text-xs text-primary">
              {props.activeFilterCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-5">
        <SheetHeader className="px-0">
          <SheetTitle>Refine results</SheetTitle>
        </SheetHeader>
        <ResourceFilterPanel {...props} />
      </SheetContent>
    </Sheet>
  );
}
