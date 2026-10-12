import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Flame, Search, Sparkles, TrendingUp } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { popularChapters, trendingSearchTerms } from "@/data/resource-center";
import { useRecentSearches, useSearchSuggestions } from "@/hooks/use-resource-search";

export interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Global search palette (⌘K / Ctrl+K). Keyboard navigation, recent searches,
 * trending terms and popular chapters in one accessible dialog.
 */
export function SearchPalette({ open, onOpenChange }: SearchPaletteProps) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { recent, remember, clear } = useRecentSearches();
  const { suggestions, loading } = useSearchSuggestions(term);

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  function goToSearch(nextTerm: string) {
    remember(nextTerm);
    onOpenChange(false);
    void navigate({ to: "/library/search", search: { q: nextTerm } });
  }

  function openResource(id: string, label: string) {
    remember(label);
    onOpenChange(false);
    void navigate({ to: "/library/resource/$resourceId", params: { resourceId: id } });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Search YourSchool</DialogTitle>
      <DialogDescription className="sr-only">
        Search grades, subjects, chapters, lessons, videos, notes, worksheets and more.
      </DialogDescription>
      <CommandInput
        placeholder="Search chapters, videos, notes, worksheets…"
        value={term}
        onValueChange={setTerm}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Searching…" : "No matches. Try a chapter name or a resource type."}
        </CommandEmpty>

        {term.trim() && suggestions.length ? (
          <CommandGroup heading="Suggestions">
            {suggestions.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.context}`}
                onSelect={() => openResource(item.id, item.label)}
              >
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.kind}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {term.trim() ? (
          <CommandGroup heading="Full search">
            <CommandItem value={`search ${term}`} onSelect={() => goToSearch(term)}>
              <Search className="size-4" aria-hidden="true" />
              See all results for “{term}”
            </CommandItem>
          </CommandGroup>
        ) : null}

        {!term.trim() && recent.length ? (
          <>
            <CommandGroup heading="Recent searches">
              {recent.map((item) => (
                <CommandItem key={item} value={item} onSelect={() => goToSearch(item)}>
                  <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                  {item}
                </CommandItem>
              ))}
              <CommandItem value="clear recent searches" onSelect={clear}>
                <span className="text-xs text-muted-foreground">Clear recent searches</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        ) : null}

        {!term.trim() ? (
          <>
            <CommandGroup heading="Trending searches">
              {trendingSearchTerms.map((item) => (
                <CommandItem key={item} value={item} onSelect={() => goToSearch(item)}>
                  <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Popular chapters">
              {popularChapters.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.chapter} ${item.subject}`}
                  onSelect={() => goToSearch(item.chapter)}
                >
                  <Flame className="size-4 text-warning" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.chapter}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.grade} · {item.subject}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}

/** Registers the ⌘K / Ctrl+K shortcut and owns the palette's open state. */
export function useSearchPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen };
}

