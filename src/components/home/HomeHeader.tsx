import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Grades", to: "/grades" },
  { label: "Subjects", to: "/subjects" },
  { label: "Practice", to: "/practice" },
  { label: "Resources", to: "/resources" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;


function HomeBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      aria-label="YourCBSE home"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        Your<span className="text-primary">CBSE</span>
      </span>
    </Link>
  );
}

/** Sticky marketing header — logo, nav, search, theme toggle and auth actions. */
export function HomeHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:h-18 lg:gap-5 lg:px-8">
        <HomeBrand />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200",
                    "hover:bg-secondary hover:text-foreground",
                    "after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-all after:duration-200",
                    "hover:after:w-5",
                  )}
                  activeProps={{
                    className: "bg-secondary text-foreground font-semibold after:w-5",
                    "aria-current": "page",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 md:block">
          <SearchAutocomplete
            size="sm"
            placeholder="Search chapters…"
            aria-label="Search chapters, subjects and grades"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl md:hidden"
            aria-label="Open search"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search className="size-5" aria-hidden="true" />
          </Button>

          <ThemeToggle />

          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="hidden rounded-xl sm:inline-flex">
            <Link to="/register">Register</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl lg:hidden">
                <Menu className="size-5" aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-xs bg-background p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="border-b border-border p-5">
                <HomeBrand onNavigate={() => setOpen(false)} />
              </div>
              <nav aria-label="Mobile" className="p-3">
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        activeProps={{
                          className: "bg-secondary text-primary font-semibold",
                          "aria-current": "page",
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="space-y-2 border-t border-border p-5">
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full rounded-xl">
                  <Link to="/register" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <SearchAutocomplete placeholder="Search chapters, subjects…" />
        </div>
      ) : null}
    </header>
  );
}
