import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  FileText,
  Star,
} from "lucide-react";

import {
  PublicLayout,
  PublicPageShell,
} from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";

const title =
  "YourTeacher Blog — Study Tips & Exam Strategy";

const description =
  "Practical CBSE study guides, revision plans and classroom ideas for students and teachers.";

export const Route = createFileRoute("/blog")({
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
  component: BlogPage,
});

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  featured_image: string | null;
  status: string;
  read_minutes: number;
  is_featured: boolean;
  published_at: string | null;
};

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function BlogPage() {
  const [posts, setPosts] = useState<
    BlogPost[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [category, setCategory] =
    useState("all");

  async function loadPosts() {
    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/public/blog`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load blog (${response.status}).`,
        );
      }

      const rawText =
        await response.text();

      const cleanText = rawText
        .replace(
          /^[\uFEFF\u200B]+/,
          "",
        )
        .trim();

      const data =
        cleanText === ""
          ? []
          : JSON.parse(cleanText);

      setPosts(
        Array.isArray(data)
          ? data
          : data.data ?? [],
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load blog posts.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          posts
            .map((post) =>
              post.category?.trim(),
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(value),
            ),
        ),
      ).sort(),
    [posts],
  );

  const visiblePosts = useMemo(
    () =>
      category === "all"
        ? posts
        : posts.filter(
            (post) =>
              post.category ===
              category,
          ),
    [posts, category],
  );

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[
            {
              label: "Home",
              to: "/",
            },
            {
              label: "Blog",
            },
          ]}
          title="Blog"
          description="Study strategy, revision techniques and teaching ideas from the YourTeacher team."
        />

        {categories.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setCategory("all")
              }
              className={`rounded-full border px-4 py-2 text-sm ${
                category === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background"
              }`}
            >
              All
            </button>

            {categories.map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`rounded-full border px-4 py-2 text-sm ${
                    category === item
                      ? "bg-primary text-primary-foreground"
                      : "bg-background"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
            Loading articles...
          </div>
        ) : error ? (
          <div className="rounded-2xl border p-6 text-center">
            <p className="font-medium">
              Blog could not be loaded.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadPosts()
              }
              className="mt-4 rounded-md border px-4 py-2 text-sm"
            >
              Try again
            </button>
          </div>
        ) : visiblePosts.length ===
          0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed text-center">
            <FileText className="size-8 text-muted-foreground" />

            <div>
              <p className="font-medium">
                No published articles yet
              </p>

              <p className="text-sm text-muted-foreground">
                Published articles will
                appear here automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map(
              (post) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block h-full"
                >
                  <Card className="h-full cursor-pointer overflow-hidden pt-0 transition hover:-translate-y-0.5 hover:shadow-md">
                    {post.featured_image ? (
                      <div className="aspect-[16/8] overflow-hidden bg-muted">
                        <img
                          src={
                            post.featured_image
                          }
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/8] items-center justify-center bg-primary/10">
                        <FileText className="size-10 text-primary/50" />
                      </div>
                    )}

                    <CardContent className="space-y-3 px-6 pb-6">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.category ? (
                          <Badge variant="secondary">
                            {
                              post.category
                            }
                          </Badge>
                        ) : null}

                        {post.is_featured ? (
                          <Badge variant="outline">
                            <Star className="mr-1 size-3" />
                            Featured
                          </Badge>
                        ) : null}
                      </div>

                      <h2 className="font-heading text-lg font-semibold">
                        {post.title}
                      </h2>

                      {post.excerpt ? (
                        <p className="text-sm text-muted-foreground">
                          {post.excerpt}
                        </p>
                      ) : null}

                      <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5" />

                          {post.read_minutes} min
                          read
                        </span>

                        <span>
                          {formatDate(
                            post.published_at,
                          )}
                        </span>
                      </p>

                      <p className="pt-1 text-sm font-medium text-primary">
                        Read article →
                      </p>
                    </CardContent>
                  </Card>
                </a>
              ),
            )}
          </div>
        )}
      </PublicPageShell>
    </PublicLayout>
  );
}