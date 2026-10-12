import { createFileRoute } from "@tanstack/react-router";
import {
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/seo")({
  head: () => ({
    meta: [
      {
        title: "SEO Manager - YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Manage search metadata for public YourSchool pages.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminSeoPage,
});

type SeoPage = {
  id: number;
  path: string;
  title: string;
  meta_description: string | null;
  canonical_url: string | null;
  is_indexed: boolean;
  score: number;
  updated_at: string | null;
};

type SeoStats = {
  total_pages: number;
  indexed_pages: number;
  noindex_pages: number;
  average_score: number;
};

type SeoResponse = {
  pages?: SeoPage[];
  page?: SeoPage;
  stats?: SeoStats;
  message?: string;
};

type SeoDraft = {
  path: string;
  title: string;
  meta_description: string;
  canonical_url: string;
  is_indexed: boolean;
};

const EMPTY_STATS: SeoStats = {
  total_pages: 0,
  indexed_pages: 0,
  noindex_pages: 0,
  average_score: 0,
};

const EMPTY_DRAFT: SeoDraft = {
  path: "/",
  title: "",
  meta_description: "",
  canonical_url: "",
  is_indexed: true,
};

function pageToDraft(
  page: SeoPage,
): SeoDraft {
  return {
    path: page.path,
    title: page.title,
    meta_description:
      page.meta_description ?? "",
    canonical_url:
      page.canonical_url ?? "",
    is_indexed: page.is_indexed,
  };
}

function draftChanged(
  page: SeoPage,
  draft?: SeoDraft,
) {
  if (!draft) {
    return false;
  }

  return (
    page.path !== draft.path ||
    page.title !== draft.title ||
    (page.meta_description ?? "") !==
      draft.meta_description ||
    (page.canonical_url ?? "") !==
      draft.canonical_url ||
    page.is_indexed !==
      draft.is_indexed
  );
}

function calculateStats(
  pages: SeoPage[],
): SeoStats {
  const total = pages.length;

  const indexed =
    pages.filter(
      (page) => page.is_indexed,
    ).length;

  const noindex =
    total - indexed;

  const average =
    total > 0
      ? Math.round(
          pages.reduce(
            (sum, page) =>
              sum + page.score,
            0,
          ) / total,
        )
      : 0;

  return {
    total_pages: total,
    indexed_pages: indexed,
    noindex_pages: noindex,
    average_score: average,
  };
}

function AdminSeoPage() {
  const [pages, setPages] =
    useState<SeoPage[]>([]);

  const [drafts, setDrafts] =
    useState<
      Record<number, SeoDraft>
    >({});

  const [stats, setStats] =
    useState<SeoStats>(EMPTY_STATS);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [
    editingNew,
    setEditingNew,
  ] = useState(false);

  const [newDraft, setNewDraft] =
    useState<SeoDraft | null>(null);

  async function loadSeoPages(
    preferredId?: number,
  ) {
    setLoading(true);

    const result =
      await apiRequest<SeoResponse>(
        "/admin/seo-pages",
        {
          method: "GET",
        },
      );

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to load SEO pages.",
      );

      setLoading(false);
      return;
    }

    const data =
      (result.data ?? {}) as SeoResponse;

    const loadedPages =
      data.pages ?? [];

    const loadedDrafts:
      Record<number, SeoDraft> = {};

    loadedPages.forEach((page) => {
      loadedDrafts[page.id] =
        pageToDraft(page);
    });

    setPages(loadedPages);
    setDrafts(loadedDrafts);

    setStats(
      data.stats ??
        calculateStats(loadedPages),
    );

    const selected =
      loadedPages.find(
        (page) =>
          page.id === preferredId,
      ) ??
      loadedPages[0] ??
      null;

    setSelectedId(
      selected?.id ?? null,
    );

    setEditingNew(false);
    setNewDraft(null);

    setLoading(false);
  }

  useEffect(() => {
    void loadSeoPages();
  }, []);

  const dirtyIds =
    useMemo(
      () =>
        pages
          .filter((page) =>
            draftChanged(
              page,
              drafts[page.id],
            ),
          )
          .map((page) => page.id),
      [pages, drafts],
    );

  const pendingCount =
    dirtyIds.length +
    (newDraft ? 1 : 0);

  const filteredPages =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return pages;
      }

      return pages.filter(
        (page) =>
          page.path
            .toLowerCase()
            .includes(query) ||
          page.title
            .toLowerCase()
            .includes(query),
      );
    }, [pages, search]);

  const selectedPage =
    pages.find(
      (page) =>
        page.id === selectedId,
    ) ?? null;

  const activeDraft =
    editingNew
      ? newDraft
      : selectedId !== null
        ? drafts[selectedId]
        : null;

  function selectPage(
    page: SeoPage,
  ) {
    setSelectedId(page.id);
    setEditingNew(false);
  }

  function startCreate() {
    if (!newDraft) {
      setNewDraft({
        ...EMPTY_DRAFT,
      });
    }

    setEditingNew(true);
    setSelectedId(null);
  }

  function editNewPage() {
    if (!newDraft) {
      return;
    }

    setEditingNew(true);
    setSelectedId(null);
  }

  function discardNewPage() {
    setNewDraft(null);
    setEditingNew(false);

    const firstPage =
      pages[0] ?? null;

    setSelectedId(
      firstPage?.id ?? null,
    );
  }

  function updateActiveDraft(
    changes: Partial<SeoDraft>,
  ) {
    if (editingNew) {
      setNewDraft((current) => ({
        ...(current ??
          EMPTY_DRAFT),
        ...changes,
      }));

      return;
    }

    if (selectedId === null) {
      return;
    }

    setDrafts((current) => ({
      ...current,
      [selectedId]: {
        ...current[selectedId],
        ...changes,
      },
    }));
  }

  async function saveAllChanges() {
    if (pendingCount === 0) {
      toast.info(
        "There are no unsaved SEO changes.",
      );
      return;
    }

    setSaving(true);

    let successfulChanges = 0;
    let failedChanges = 0;

    const savedPages =
      new Map<number, SeoPage>();

    for (const id of dirtyIds) {
      const draft = drafts[id];

      if (!draft) {
        continue;
      }

      if (
        !draft.path.trim() ||
        !draft.title.trim()
      ) {
        toast.error(
          "Every SEO page needs a path and title.",
        );

        setSaving(false);
        return;
      }

      const result =
        await apiRequest<SeoResponse>(
          `/admin/seo-pages/${id}`,
          {
            method: "PATCH",
            body: {
              path: draft.path.trim(),
              title:
                draft.title.trim(),
              meta_description:
                draft.meta_description.trim() ||
                null,
              canonical_url:
                draft.canonical_url.trim() ||
                null,
              is_indexed:
                draft.is_indexed,
            },
          },
        );

      if (
        result.ok &&
        result.data?.page
      ) {
        savedPages.set(
          id,
          result.data.page,
        );

        successfulChanges += 1;
      } else {
        failedChanges += 1;

        toast.error(
          result.message ??
            `Unable to save ${draft.path}.`,
        );
      }
    }

    let createdPage:
      | SeoPage
      | null = null;

    if (newDraft) {
      if (
        !newDraft.path.trim() ||
        !newDraft.title.trim()
      ) {
        toast.error(
          "The new SEO page needs a path and title.",
        );

        setSaving(false);
        return;
      }

      const result =
        await apiRequest<SeoResponse>(
          "/admin/seo-pages",
          {
            method: "POST",
            body: {
              path:
                newDraft.path.trim(),
              title:
                newDraft.title.trim(),
              meta_description:
                newDraft.meta_description.trim() ||
                null,
              canonical_url:
                newDraft.canonical_url.trim() ||
                null,
              is_indexed:
                newDraft.is_indexed,
            },
          },
        );

      if (
        result.ok &&
        result.data?.page
      ) {
        createdPage =
          result.data.page;

        successfulChanges += 1;
      } else {
        failedChanges += 1;

        toast.error(
          result.message ??
            "Unable to create the new SEO page.",
        );
      }
    }

    let nextPages = pages.map(
      (page) =>
        savedPages.get(page.id) ??
        page,
    );

    if (createdPage) {
      nextPages = [
        ...nextPages,
        createdPage,
      ].sort((a, b) =>
        a.path.localeCompare(b.path),
      );
    }

    setPages(nextPages);
    setStats(
      calculateStats(nextPages),
    );

    setDrafts((current) => {
      const next = {
        ...current,
      };

      savedPages.forEach(
        (page, id) => {
          next[id] =
            pageToDraft(page);
        },
      );

      if (createdPage) {
        next[createdPage.id] =
          pageToDraft(
            createdPage,
          );
      }

      return next;
    });

    if (createdPage) {
      setNewDraft(null);
      setEditingNew(false);
      setSelectedId(
        createdPage.id,
      );
    }

    if (
      successfulChanges > 0 &&
      failedChanges === 0
    ) {
      toast.success(
        `${successfulChanges} SEO change${
          successfulChanges === 1
            ? ""
            : "s"
        } saved.`,
      );
    } else if (
      successfulChanges > 0
    ) {
      toast.warning(
        `${successfulChanges} saved, ${failedChanges} failed.`,
      );
    }

    setSaving(false);
  }

  async function deletePage() {
    if (
      selectedId === null ||
      editingNew
    ) {
      return;
    }

    const page =
      pages.find(
        (item) =>
          item.id === selectedId,
      );

    if (!page) {
      return;
    }

    if (page.path === "/") {
      toast.error(
        "The home-page SEO record cannot be deleted.",
      );
      return;
    }

    if (
      !window.confirm(
        `Delete SEO settings for ${page.path}?`,
      )
    ) {
      return;
    }

    setDeleting(true);

    const result =
      await apiRequest<SeoResponse>(
        `/admin/seo-pages/${page.id}`,
        {
          method: "DELETE",
        },
      );

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to delete SEO page.",
      );

      setDeleting(false);
      return;
    }

    const nextPages =
      pages.filter(
        (item) =>
          item.id !== page.id,
      );

    setPages(nextPages);
    setStats(
      calculateStats(nextPages),
    );

    setDrafts((current) => {
      const next = {
        ...current,
      };

      delete next[page.id];

      return next;
    });

    setSelectedId(
      nextPages[0]?.id ?? null,
    );

    toast.success(
      result.data?.message ??
        "SEO page deleted.",
    );

    setDeleting(false);
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="SEO Manager"
      description="Edit multiple SEO pages and save only the changed records when you are finished."
      showNotice={false}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div>
          <p className="font-medium">
            {pendingCount === 0
              ? "All SEO changes are saved"
              : `${pendingCount} unsaved change${
                  pendingCount === 1
                    ? ""
                    : "s"
                }`}
          </p>

          <p className="text-xs text-muted-foreground">
            Move between pages freely. Your edits remain here until you save them together.
          </p>
        </div>

        <Button
          type="button"
          disabled={
            saving ||
            pendingCount === 0
          }
          onClick={() => {
            void saveAllChanges();
          }}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {saving
            ? "Saving changes..."
            : `Save all changes${
                pendingCount > 0
                  ? ` (${pendingCount})`
                  : ""
              }`}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="tile p-4">
          <p className="text-xs text-muted-foreground">
            SEO pages
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.total_pages}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs text-muted-foreground">
            Indexed
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.indexed_pages}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs text-muted-foreground">
            Noindex
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.noindex_pages}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs text-muted-foreground">
            Average completeness
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.average_score}%
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>
                Public pages
              </CardTitle>

              <Button
                type="button"
                size="sm"
                onClick={startCreate}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search pages..."
                className="pl-9"
              />
            </div>

            {newDraft ? (
              <button
                type="button"
                className={`w-full rounded-xl border p-3 text-left ${
                  editingNew
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={editNewPage}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {newDraft.path ||
                      "New page"}
                  </span>

                  <span className="text-xs font-medium text-amber-600">
                    Unsaved
                  </span>
                </div>
              </button>
            ) : null}

            {loading ? (
              <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading SEO pages...
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPages.map(
                  (page) => {
                    const dirty =
                      dirtyIds.includes(
                        page.id,
                      );

                    return (
                      <button
                        key={page.id}
                        type="button"
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          selectedId ===
                            page.id &&
                          !editingNew
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() =>
                          selectPage(
                            page,
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium">
                                {
                                  drafts[
                                    page
                                      .id
                                  ]
                                    ?.path ??
                                  page.path
                                }
                              </p>

                              {dirty ? (
                                <span className="text-[11px] font-medium text-amber-600">
                                  Unsaved
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {
                                drafts[
                                  page
                                    .id
                                ]
                                  ?.title ??
                                page.title
                              }
                            </p>
                          </div>

                          <span className="shrink-0 text-xs font-semibold">
                            {page.score}%
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}

                {filteredPages.length ===
                0 ? (
                  <p className="py-6 text-sm text-muted-foreground">
                    No matching SEO pages.
                  </p>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {editingNew
                ? "Add SEO page"
                : selectedPage
                  ? `Edit ${selectedPage.path}`
                  : "SEO details"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {activeDraft ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="seo-path">
                    Public path
                  </Label>

                  <Input
                    id="seo-path"
                    value={
                      activeDraft.path
                    }
                    required
                    placeholder="/about"
                    onChange={(event) =>
                      updateActiveDraft({
                        path:
                          event.target
                            .value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-title">
                    SEO title
                  </Label>

                  <Input
                    id="seo-title"
                    value={
                      activeDraft.title
                    }
                    required
                    maxLength={255}
                    onChange={(event) =>
                      updateActiveDraft({
                        title:
                          event.target
                            .value,
                      })
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    {
                      activeDraft.title
                        .length
                    }{" "}
                    characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-description">
                    Meta description
                  </Label>

                  <Textarea
                    id="seo-description"
                    rows={5}
                    maxLength={1000}
                    value={
                      activeDraft.meta_description
                    }
                    onChange={(event) =>
                      updateActiveDraft({
                        meta_description:
                          event.target
                            .value,
                      })
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    {
                      activeDraft
                        .meta_description
                        .length
                    }{" "}
                    characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-canonical">
                    Canonical URL
                  </Label>

                  <Input
                    id="seo-canonical"
                    type="url"
                    maxLength={500}
                    value={
                      activeDraft.canonical_url
                    }
                    placeholder="https://yourschool.co.in/page"
                    onChange={(event) =>
                      updateActiveDraft({
                        canonical_url:
                          event.target
                            .value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                  <div>
                    <Label htmlFor="seo-indexed">
                      Allow indexing
                    </Label>

                    <p className="text-xs text-muted-foreground">
                      Enable for pages that should appear in search engines.
                    </p>
                  </div>

                  <Switch
                    id="seo-indexed"
                    checked={
                      activeDraft.is_indexed
                    }
                    onCheckedChange={(
                      checked,
                    ) =>
                      updateActiveDraft({
                        is_indexed:
                          checked,
                      })
                    }
                  />
                </div>

                {!editingNew &&
                selectedPage ? (
                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">
                      SEO completeness
                    </p>

                    <p className="mt-1 text-3xl font-semibold">
                      {
                        selectedPage.score
                      }
                      %
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      The score updates after Save all changes.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {editingNew ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={
                        discardNewPage
                      }
                    >
                      Discard new page
                    </Button>
                  ) : null}

                  {!editingNew &&
                  selectedPage &&
                  selectedPage.path !==
                    "/" ? (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={deleting}
                      onClick={() => {
                        void deletePage();
                      }}
                    >
                      {deleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}

                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select an SEO page to edit.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalPage>
  );
}