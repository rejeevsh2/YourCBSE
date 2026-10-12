import { type ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface FilterConfig {
  id: string;
  label: string;
  options: string[];
}

interface StudioToolbarProps {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  actions?: ReactNode;
}

/** Shared search + filter bar used by every Teacher Studio manager screen. */
export function StudioToolbar({
  searchPlaceholder = "Search content…",
  filters = [],
  actions,
}: StudioToolbarProps) {
  return (
    <div className="tile flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Label htmlFor="studio-search" className="sr-only">
          {searchPlaceholder}
        </Label>
        <Input
          id="studio-search"
          type="search"
          placeholder={searchPlaceholder}
          className="h-10 rounded-2xl pl-9"
        />
      </div>

      {filters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="hidden size-4 text-muted-foreground sm:block" />
          {filters.map((filter) => (
            <Select key={filter.id}>
              <SelectTrigger
                className="h-10 w-[9.5rem] rounded-2xl"
                aria-label={`Filter by ${filter.label}`}
              >
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      ) : null}

      {actions ? <div className="flex flex-wrap gap-2 lg:ml-auto">{actions}</div> : null}
    </div>
  );
}

