import {
  useEffect,
  useState,
} from "react";
import {
  createFileRoute,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  FileText,
  Star,
} from "lucide-react";

import {
  PublicLayout,
  PublicPageShell,
} from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";

export const Route =
  createFileRoute("/blog_/$slug")({
    component: BlogArticlePage,
  });

type Author = {
  id: number;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
};

type BlogPost = {
  id: number;
  author_id: number | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  featured_image: string | null;
  status: string;
  read_minutes: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  author?: Author | null;
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
      month: "long",
      year: "numeric",
    },
  );
}

function getAuthorName(
  post: BlogPost,
) {
  return (
    post.author?.fullName ||
    post.author?.name ||
    post.author?.email ||
    "YourTeacher Team"
  );
}

function BlogArticlePage() {
  const { slug } = Route.useParams();

  const [post, setPost] =
    useState<BlogPost | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError("");

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/public/blog/${encodeURIComponent(slug)}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (response.status === 404) {
          throw new Error(
            "This article was not found or is not published.",
          );
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load article (${response.status}).`,
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
            ? null
            : JSON.parse(cleanText);

        setPost(
          data?.data ?? data ?? null,
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load article.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPost();
  }, [slug]);

  return (
    <PublicLayout>
      <PublicPageShell>
        <div className="mx-auto max-w-4xl">
          <a
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to Blog
          </a>

          {loading ? (
            <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
              Loading article...
            </div>
          ) : error || !post ? (
            <div className="rounded-3xl border bg-card p-8 text-center">
              <FileText className="mx-auto size-9 text-muted-foreground" />

              <h1 className="mt-4 text-xl font-bold">
                Article unavailable
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {error ||
                  "This article could not be loaded."}
              </p>

              <Button
                type="button"
                className="mt-5"
                onClick={() =>
                  window.location.assign(
                    "/blog",
                  )
                }
              >
                Return to Blog
              </Button>
            </div>
          ) : (
            <article>
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {post.category ? (
                  <Badge variant="secondary">
                    {post.category}
                  </Badge>
                ) : null}

                {post.is_featured ? (
                  <Badge variant="outline">
                    <Star className="mr-1 size-3" />
                    Featured
                  </Badge>
                ) : null}
              </div>

              <h1 className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
                {post.title}
              </h1>

              {post.excerpt ? (
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  {post.excerpt}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>
                  By {getAuthorName(post)}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {post.read_minutes} min read
                </span>

                <span>
                  {formatDate(
                    post.published_at,
                  )}
                </span>
              </div>

              {post.featured_image ? (
                <div className="mt-8 overflow-hidden rounded-3xl border bg-muted">
                  <img
                    src={
                      post.featured_image
                    }
                    alt={post.title}
                    className="max-h-[500px] w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="mt-10 rounded-3xl border bg-card p-6 md:p-9">
                <div className="whitespace-pre-wrap text-base leading-8">
                  {post.content}
                </div>
              </div>
            </article>
          )}
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}