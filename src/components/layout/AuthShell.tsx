import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/common/Brand";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

const highlights = [
  "700+ chapters mapped",
  "1,200+ video lessons",
  "Teacher-built practice sets",
];

/**
 * Layout + card shell shared by every auth screen.
 * Presentational only — all data flows through `authService`.
 */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground lg:flex xl:p-12">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-24 size-[28rem] rounded-full bg-primary-foreground/15 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[-8rem] bottom-[-10rem] size-[26rem] rounded-full bg-secondary/40 blur-3xl"
        />
        <Brand className="relative [&_span]:text-primary-foreground" />
        <div className="relative space-y-5">
          <p className="font-heading text-4xl leading-tight font-extrabold">
            Everything You Need to Succeed in CBSE
          </p>
          <p className="max-w-sm text-sm text-primary-foreground">
            Notes, videos, worksheets and interactive practice — organised chapter by chapter for
            Classes 6 to 12.
          </p>
          <ul className="space-y-2.5 text-sm text-primary-foreground">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-primary-foreground" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/90">yourschool.co.in</p>
      </aside>

      <main className="flex flex-col bg-background px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="lg:hidden">
            <Brand subtitle="Everything you need to succeed" />
          </div>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 py-8">
          <Card>
            <CardHeader>
              <h1 className="font-heading text-2xl leading-none font-semibold tracking-tight">
                {title}
              </h1>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">{children}</CardContent>
          </Card>
          {footer ? <p className="text-center text-sm text-muted-foreground">{footer}</p> : null}
          <p className="text-center text-xs text-muted-foreground">
            <Link
              to="/"
              className="rounded-sm hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

