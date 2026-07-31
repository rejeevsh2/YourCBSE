import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, CalendarClock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ComingSoonProps {
  eyebrow?: string;
  title: string;
  description: string;
  /** Short bullet list of what the feature will include. */
  highlights?: string[];
  expected?: string;
  icon?: ReactNode;
}

/** Reusable "Coming soon" screen for features that ship in a later phase. */
export function ComingSoon({
  eyebrow = "Coming soon",
  title,
  description,
  highlights = [],
  expected,
  icon,
}: ComingSoonProps) {
  return (
    <section className="tile mx-auto grid w-full max-w-4xl gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
      <div className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {eyebrow}
        </span>
        <div className="space-y-2.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        {highlights.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                />
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {expected ? (
          <p className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
            <CalendarClock className="size-4 text-primary" aria-hidden="true" />
            Expected: {expected}
          </p>
        ) : null}

        <form
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="coming-soon-email" className="sr-only">
            Email address for launch updates
          </label>
          <Input
            id="coming-soon-email"
            type="email"
            placeholder="you@example.com"
            className="h-11 flex-1 rounded-xl"
          />
          <Button type="submit" className="h-11 rounded-xl">
            <Bell className="size-4" aria-hidden="true" />
            Notify me
          </Button>
        </form>

        <Button asChild variant="ghost" className="rounded-xl px-0">
          <Link to="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
        </Button>
      </div>

      <div
        className="tile relative flex aspect-[4/3] items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <span className="absolute -top-12 -right-8 size-48 rounded-full bg-primary/10 blur-3xl" />
        <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          {icon ?? <Sparkles className="size-9" />}
        </span>
      </div>
    </section>
  );
}
