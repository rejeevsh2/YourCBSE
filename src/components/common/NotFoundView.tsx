import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass, GraduationCap, LibraryBig, ListChecks, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";

const popularLinks = [
  { label: "Browse grades", to: "/grades", icon: GraduationCap },
  { label: "Browse subjects", to: "/subjects", icon: LibraryBig },
  { label: "Practice tests", to: "/practice", icon: ListChecks },
  { label: "Resources", to: "/resources", icon: PlayCircle },
] as const;

/** Premium 404 screen — illustration placeholder, search and popular destinations. */
export function NotFoundView() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Compass className="size-3.5" aria-hidden="true" />
            Error 404
          </span>
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              This page took an unplanned holiday
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              The link may be broken or the chapter may have moved. Search below or jump to one of
              the popular sections.
            </p>
          </div>

          <SearchAutocomplete
            withButton
            placeholder="Search chapters, videos, worksheets…"
            aria-label="Search YourCBSE from the 404 page"
          />

          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-xl">
              <Link to="/">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Return home
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/contact">Report a broken link</Link>
            </Button>
          </div>

          <nav aria-label="Popular links">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Popular links
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {popularLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="tile tile-interactive flex items-center gap-3 p-3 text-sm font-medium text-foreground"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <link.icon className="size-4" aria-hidden="true" />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Illustration placeholder */}
        <div className="tile relative flex aspect-square items-center justify-center overflow-hidden p-8" aria-hidden="true">
          <span className="absolute -top-16 -right-10 size-64 rounded-full bg-primary/10 blur-3xl" />
          <span className="absolute -bottom-20 -left-12 size-64 rounded-full bg-violet/10 blur-3xl" />
          <p className="relative font-heading text-[7rem] leading-none font-extrabold text-primary/25 sm:text-[9rem]">
            404
          </p>
          <span className="tile absolute bottom-8 left-8 flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <GraduationCap className="size-4 text-primary" />
            Illustration placeholder
          </span>
        </div>
      </div>
    </main>
  );
}
