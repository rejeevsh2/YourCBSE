import { useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  LibraryBig,
  Search,
  Target,
} from "lucide-react";

import { SkipLink } from "@/components/common/SkipLink";
import {
  HomeThemeProvider,
} from "@/components/home/HomeShell";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeFooter } from "@/components/home/HomeFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const title =
  "YourSchool — CBSE Learning for Classes 6 to 12";

const description =
  "Explore published CBSE lessons, resources, practice tools and study content organised by grade and subject.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
    ],
  }),

  component: HomePage,
});

const exploreItems = [
  {
    title: "Browse Grades",
    description:
      "Start with your class and move through subjects, units, chapters and lessons.",
    icon: GraduationCap,
    to: "/grades" as const,
  },
  {
    title: "Browse Subjects",
    description:
      "Explore the subjects currently available in the published curriculum.",
    icon: BookOpen,
    to: "/subjects" as const,
  },
  {
    title: "Resource Library",
    description:
      "Find published notes, worksheets, videos and other learning resources.",
    icon: LibraryBig,
    to: "/resources" as const,
  },
  {
    title: "Practice Center",
    description:
      "Sign in as a student to use practice sets and keep your attempts and progress.",
    icon: Target,
    to: "/practice" as const,
  },
  {
    title: "Blog",
    description:
      "Read published study guidance, revision ideas and educational articles.",
    icon: FileText,
    to: "/blog" as const,
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function submitSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value = query.trim();

    if (!value) {
      void navigate({
        to: "/search",
        search: {},
      });

      return;
    }

    void navigate({
      to: "/search",
      search: {
        q: value,
      },
    });
  }

  return (
    <HomeThemeProvider>
      <SkipLink />
      <HomeHeader />

      <main
        id="main-content"
        tabIndex={-1}
      >
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                CBSE Classes 6–12
              </p>

              <h1 className="max-w-3xl font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Learn CBSE chapter by chapter with YourSchool
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Browse published curriculum, open lessons and learning resources,
                and continue into the Student Portal when you are ready to track
                progress and practise.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                >
                  <Link to="/grades">
                    Browse Grades
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                >
                  <Link to="/register">
                    Create Student Account
                  </Link>
                </Button>
              </div>
            </div>

            <div className="panel p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Search className="size-5" />
                </span>

                <div>
                  <h2 className="font-heading text-xl font-bold">
                    Search learning resources
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Search the published Resource Library.
                  </p>
                </div>
              </div>

              <form
                onSubmit={submitSearch}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search notes, worksheets, videos..."
                  aria-label="Search learning resources"
                  className="h-12"
                />

                <Button
                  type="submit"
                  size="lg"
                >
                  Search
                </Button>
              </form>

              <div className="mt-4">
                <Link
                  to="/resources"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Browse all resources
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Explore YourSchool
              </p>

              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight">
                Start with what you need
              </h2>

              <p className="mt-3 text-muted-foreground">
                Public learning content is organised around the same curriculum
                managed through the YourSchool platform.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exploreItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="panel panel-interactive group flex h-full flex-col p-6"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>

                    <h3 className="mt-5 font-heading text-lg font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Explore
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <h2 className="font-heading text-2xl font-bold">
                Want progress tracking and practice?
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Student accounts provide access to your dashboard, learning
                progress, revision tools, practice history, planner,
                notifications and saved learning activity.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Button asChild>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
              >
                <Link to="/register">
                  Register
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </HomeThemeProvider>
  );
}