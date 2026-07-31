import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, PlayCircle, Sparkles } from "lucide-react";
import { Brand } from "@/components/common/Brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const title = "Welcome to YourCBSE — Learn Smarter";
const description =
  "Everything you need to succeed in CBSE — notes, videos, worksheets and interactive practice for Classes 6 to 12.";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

const highlights = [
  { icon: BookOpen, label: "700+ chapters" },
  { icon: PlayCircle, label: "1,200+ videos" },
  { icon: Sparkles, label: "AI study help" },
];

function WelcomePage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative flex flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground sm:p-12">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-24 size-[28rem] rounded-full bg-primary-foreground/15 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[-8rem] bottom-[-10rem] size-[26rem] rounded-full bg-secondary/40 blur-3xl"
        />
        <Brand className="relative [&_span]:text-primary-foreground" />

        <div className="animate-in fade-in-0 slide-in-from-bottom-2 relative py-12 duration-500">
          {/* Student learning illustration — pure CSS/SVG, no external asset */}
          <div className="mx-auto grid max-w-sm grid-cols-3 gap-3" aria-hidden="true">
            <div className="col-span-2 flex h-32 flex-col justify-end rounded-3xl bg-primary-foreground/10 p-4 backdrop-blur">
              <GraduationCap className="mb-2 size-7" />
              <div className="h-2 w-3/4 rounded-full bg-primary-foreground/40" />
              <div className="mt-1.5 h-2 w-1/2 rounded-full bg-primary-foreground/25" />
            </div>
            <div className="flex h-32 items-center justify-center rounded-3xl bg-primary-foreground/20">
              <PlayCircle className="size-9" />
            </div>
            <div className="flex h-24 items-center justify-center rounded-3xl bg-primary-foreground/20">
              <BookOpen className="size-7" />
            </div>
            <div className="col-span-2 flex h-24 flex-col justify-center gap-2 rounded-3xl bg-primary-foreground/10 p-4">
              <div className="h-2 w-full rounded-full bg-primary-foreground/35" />
              <div className="h-2 w-2/3 rounded-full bg-primary-foreground/25" />
              <div className="h-2 w-1/3 rounded-full bg-primary-foreground/20" />
            </div>
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/70">yourcbse.com</p>
      </section>

      <section className="flex flex-col bg-background p-6 sm:p-12">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 duration-500">
          <div className="space-y-4 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Brand />
            </div>
            <h1 className="font-heading text-3xl leading-tight font-extrabold text-foreground sm:text-4xl">
              Everything You Need to Succeed in CBSE
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              One home for notes, videos, worksheets and interactive practice — organised chapter by
              chapter for Classes 6 to 12.
            </p>
          </div>

          <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
            {highlights.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <item.icon className="size-3.5 text-primary" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link to="/register">Create Account</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary hover:underline">
                Continue browsing without an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
