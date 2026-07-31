import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, Command, Download, History, LayoutGrid, Search } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { SearchPalette, useSearchPalette } from "./SearchPalette";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/library", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/library/search", label: "Search", icon: Search, exact: false },
  { to: "/library/favorites", label: "Favourites", icon: Bookmark, exact: false },
  { to: "/library/downloads", label: "Downloads", icon: Download, exact: false },
  { to: "/library/recent", label: "Recently viewed", icon: History, exact: false },
] as const;

/**
 * Shared chrome for every Resource Center screen: public layout, section nav
 * and the global ⌘K search palette.
 */
export function LibraryShell({ children }: { children: ReactNode }) {
  const { open, setOpen } = useSearchPalette();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <PublicLayout>
      <PublicPageShell>
        <nav
          aria-label="Resource Center sections"
          className="tile flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <ul className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => {
              const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <tab.icon className="size-4" aria-hidden="true" />
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setOpen(true)}
            aria-keyshortcuts="Meta+K Control+K"
          >
            <Command className="size-4" aria-hidden="true" />
            Quick search
            <kbd className="ml-1 hidden rounded-md border border-border px-1.5 text-[10px] text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </Button>
        </nav>

        {children}
      </PublicPageShell>

      <SearchPalette open={open} onOpenChange={setOpen} />
    </PublicLayout>
  );
}
