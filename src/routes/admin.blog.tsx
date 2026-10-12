import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({
    meta: [
      {
        title: "Blog — YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Manage blog articles, drafts and publication.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminBlogPage,
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
  status:
    | "draft"
    | "in_review"
    | "published"
    | "archived";
  read_minutes: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  author?: Author | null;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  status:
    | "draft"
    | "in_review"
    | "published"
    | "archived";
  read_minutes: string;
  is_featured: boolean;
  published_at: string;
};

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  featured_image: "",
  status: "draft",
  read_minutes: "5",
  is_featured: false,
  published_at: "",
};

function formatStatus(
  value: BlogPost["status"],
) {
  if (value === "in_review") {
    return "In review";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateTimeLocal(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset() * 60000;

  return new Date(
    date.getTime() - offset,
  )
    .toISOString()
    .slice(0, 16);
}

function getAuthorName(
  post: BlogPost,
) {
  return (
    post.author?.fullName ||
    post.author?.name ||
    post.author?.email ||
    "Admin"
  );
}

function AdminBlogPage() {
  const [posts, setPosts] = useState<
    BlogPost[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<BlogForm>(emptyForm);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  async function loadPosts() {
    setLoading(true);

    try {
      const result =
        await apiRequest<BlogPost[]>(
          "/blog-posts",
          {
            method: "GET",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not load blog posts.",
        );
      }

      setPosts(
        Array.isArray(result.data)
          ? result.data
          : [],
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load blog posts.",
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
              (value): value is string =>
                Boolean(value),
            ),
        ),
      ).sort(),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title
          .toLowerCase()
          .includes(query) ||
        post.slug
          .toLowerCase()
          .includes(query) ||
        (post.excerpt ?? "")
          .toLowerCase()
          .includes(query) ||
        (post.category ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        post.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        post.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    posts,
    search,
    statusFilter,
    categoryFilter,
  ]);

  const publishedCount =
    posts.filter(
      (post) =>
        post.status === "published",
    ).length;

  const draftCount =
    posts.filter(
      (post) => post.status === "draft",
    ).length;

  const reviewCount =
    posts.filter(
      (post) =>
        post.status === "in_review",
    ).length;

  const featuredCount =
    posts.filter(
      (post) => post.is_featured,
    ).length;

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(
    post: BlogPost,
  ) {
    setEditingId(post.id);

    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      category: post.category ?? "",
      featured_image:
        post.featured_image ?? "",
      status: post.status,
      read_minutes: String(
        post.read_minutes ?? 5,
      ),
      is_featured:
        Boolean(post.is_featured),
      published_at:
        toDateTimeLocal(
          post.published_at,
        ),
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error(
        "Please enter a post title.",
      );
      return;
    }

    if (!form.content.trim()) {
      toast.error(
        "Please enter the article content.",
      );
      return;
    }

    setSaving(true);

    try {
      const result =
        await apiRequest<BlogPost>(
          editingId
            ? `/blog-posts/${editingId}`
            : "/blog-posts",
          {
            method: editingId
              ? "PUT"
              : "POST",
            body: {
              title: form.title.trim(),
              slug:
                form.slug.trim() || null,
              excerpt:
                form.excerpt.trim() ||
                null,
              content:
                form.content.trim(),
              category:
                form.category.trim() ||
                null,
              featured_image:
                form.featured_image.trim() ||
                null,
              status: form.status,
              read_minutes: Number(
                form.read_minutes || "5",
              ),
              is_featured:
                form.is_featured,
              published_at:
                form.published_at ||
                null,
            },
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not save blog post.",
        );
      }

      toast.success(
        editingId
          ? "Blog post updated."
          : "Blog post created.",
      );

      closeForm();
      await loadPosts();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save blog post.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(
    post: BlogPost,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${post.title}"?\n\nThis permanently removes the blog post.`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(post.id);

    try {
      const result =
        await apiRequest(
          `/blog-posts/${post.id}`,
          {
            method: "DELETE",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete blog post.",
        );
      }

      setPosts((current) =>
        current.filter(
          (item) =>
            item.id !== post.id,
        ),
      );

      toast.success(
        "Blog post deleted.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete blog post.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Blog"
      description="Editorial articles, study guides and platform news."
      showNotice={false}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Published"
            value={String(
              publishedCount,
            )}
            hint={`${posts.length} total posts`}
            tone="success"
          />

          <StatCard
            label="Drafts"
            value={String(draftCount)}
            hint="Not yet published"
            tone="primary"
          />

          <StatCard
            label="In review"
            value={String(reviewCount)}
            hint="Awaiting publication"
            tone="primary"
          />

          <StatCard
            label="Featured"
            value={String(
              featuredCount,
            )}
            hint="Highlighted articles"
            tone="success"
          />
        </div>

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border bg-card p-5 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                {editingId
                  ? "Edit blog post"
                  : "Create blog post"}
              </h2>

              <p className="text-sm text-muted-foreground">
                Draft the article and
                control when it becomes
                publicly visible.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="blog-title">
                  Title
                </Label>

                <Input
                  id="blog-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title:
                        event.target.value,
                    })
                  }
                  placeholder="How to revise effectively for CBSE exams"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-slug">
                  Slug
                </Label>

                <Input
                  id="blog-slug"
                  value={form.slug}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      slug:
                        event.target.value,
                    })
                  }
                  placeholder="Leave empty to generate automatically"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-category">
                  Category
                </Label>

                <Input
                  id="blog-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category:
                        event.target.value,
                    })
                  }
                  placeholder="Study strategy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-read">
                  Read time
                </Label>

                <Input
                  id="blog-read"
                  type="number"
                  min="1"
                  max="999"
                  value={
                    form.read_minutes
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      read_minutes:
                        event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="blog-excerpt">
                  Excerpt
                </Label>

                <textarea
                  id="blog-excerpt"
                  value={form.excerpt}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      excerpt:
                        event.target.value,
                    })
                  }
                  rows={3}
                  placeholder="A short summary shown on the Blog page."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="blog-content">
                  Article content
                </Label>

                <textarea
                  id="blog-content"
                  value={form.content}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      content:
                        event.target.value,
                    })
                  }
                  rows={14}
                  placeholder="Write the full article here..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="blog-image">
                  Featured image URL
                </Label>

                <Input
                  id="blog-image"
                  type="url"
                  value={
                    form.featured_image
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      featured_image:
                        event.target.value,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-status">
                  Status
                </Label>

                <select
                  id="blog-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status:
                        event.target
                          .value as BlogForm["status"],
                    })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="in_review">
                    In review
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="archived">
                    Archived
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="published-at">
                  Publish date/time
                </Label>

                <Input
                  id="published-at"
                  type="datetime-local"
                  value={
                    form.published_at
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      published_at:
                        event.target.value,
                    })
                  }
                />

                <p className="text-xs text-muted-foreground">
                  Leave empty when
                  publishing immediately.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      form.is_featured
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        is_featured:
                          event.target
                            .checked,
                      })
                    }
                  />

                  Feature this article
                </label>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update post"
                    : "Create post"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={closeForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-3xl border bg-card p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search posts..."
                  className="pl-9"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">
                  All statuses
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="in_review">
                  In review
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">
                  All categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() =>
                  void loadPosts()
                }
              >
                <RefreshCw
                  className={
                    loading
                      ? "size-4 animate-spin"
                      : "size-4"
                  }
                />

                Refresh
              </Button>

              <Button
                type="button"
                onClick={openCreateForm}
              >
                <Plus className="size-4" />
                New post
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold">
                  Blog posts
                </h2>

                <p className="text-sm text-muted-foreground">
                  {filteredPosts.length} of{" "}
                  {posts.length} posts
                </p>
              </div>

              <FileText className="size-5 text-muted-foreground" />
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                Loading blog posts...
              </div>
            ) : filteredPosts.length ===
              0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
                <FileText className="size-8 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    No blog posts found
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Create your first real
                    YourSchool article.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={openCreateForm}
                >
                  <Plus className="size-4" />
                  New post
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">
                        Article
                      </th>

                      <th className="px-5 py-3">
                        Category
                      </th>

                      <th className="px-5 py-3">
                        Author
                      </th>

                      <th className="px-5 py-3">
                        Status
                      </th>

                      <th className="px-5 py-3">
                        Read
                      </th>

                      <th className="px-5 py-3">
                        Published
                      </th>

                      <th className="px-5 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPosts.map(
                      (post) => (
                        <tr
                          key={post.id}
                          className="border-b last:border-b-0 hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2">
                              {post.is_featured ? (
                                <Star className="mt-0.5 size-4 shrink-0" />
                              ) : null}

                              <div>
                                <p className="font-medium">
                                  {post.title}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  /{post.slug}
                                </p>

                                {post.excerpt ? (
                                  <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                    {post.excerpt}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {post.category ? (
                              <Badge variant="outline">
                                {post.category}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {getAuthorName(
                              post,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                post.status ===
                                "published"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {formatStatus(
                                post.status,
                              )}
                            </Badge>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                            {post.read_minutes} min
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                            {formatDate(
                              post.published_at,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openEditForm(
                                    post,
                                  )
                                }
                              >
                                <Pencil className="size-4" />
                                Edit
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={
                                  deletingId ===
                                  post.id
                                }
                                onClick={() =>
                                  void deletePost(
                                    post,
                                  )
                                }
                              >
                                <Trash2 className="size-4" />

                                {deletingId ===
                                post.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </PortalPage>
  );
}