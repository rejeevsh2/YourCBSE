import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ExternalLink,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/notes")({
  head: () => ({
    meta: [
      {
        title: "Notes — YourTeacher Admin",
      },
      {
        name: "description",
        content: "Manage real learner revision notes.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminNotesPage,
});

type Lesson = {
  id: number;
  title: string;
};

type LessonContent = {
  id: number;
  lesson_id: number;
  title: string;
  content_type: string;
  resource_category: string | null;
  content: string | null;
  file_path: string | null;
  external_url: string | null;
  display_order: number | null;
  is_free: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  lesson?: Lesson | null;
};

function formatType(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(value?: string | null) {
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

function getResourceUrl(item: LessonContent) {
  return item.file_path || item.external_url || null;
}

function getSourceLabel(item: LessonContent) {
  if (item.file_path) {
    return "Uploaded file";
  }

  if (item.external_url) {
    return "External";
  }

  if (item.content) {
    return "Inline text";
  }

  return "No source";
}

function AdminNotesPage() {
  const [items, setItems] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  async function loadNotes() {
    setLoading(true);

    try {
      const result =
        await apiRequest<LessonContent[]>(
          "/lesson-contents",
          {
            method: "GET",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not load notes.",
        );
      }

      const allItems = Array.isArray(result.data)
        ? result.data
        : [];

      setItems(
        allItems.filter(
          (item) =>
            item.resource_category === "note",
        ),
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load notes.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotes();
  }, []);

  const contentTypes = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.content_type)
            .filter(Boolean),
        ),
      ).sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const lessonTitle =
        item.lesson?.title ?? "";

      const matchesSearch =
        !query ||
        item.title
          .toLowerCase()
          .includes(query) ||
        lessonTitle
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "all" ||
        item.content_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          item.is_active) ||
        (statusFilter === "inactive" &&
          !item.is_active);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    items,
    search,
    typeFilter,
    statusFilter,
  ]);

  const fileCount = items.filter(
    (item) => Boolean(item.file_path),
  ).length;

  const inlineCount = items.filter(
    (item) =>
      Boolean(item.content) &&
      !item.file_path &&
      !item.external_url,
  ).length;

  const activeCount = items.filter(
    (item) => item.is_active,
  ).length;

  function addNote() {
    window.location.assign(
      "/admin/lesson-contents",
    );
  }

  function manageNote(item: LessonContent) {
    window.location.assign(
      `/admin/lesson-contents?lesson=${item.lesson_id}`,
    );
  }

  function openNote(item: LessonContent) {
    const url = getResourceUrl(item);

    if (url) {
      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    if (item.content) {
      toast.info(
        "This note contains inline text. Use Manage to view or edit it.",
      );
      return;
    }

    toast.info(
      "This note has no file, URL or text content.",
    );
  }

  async function deleteNote(
    item: LessonContent,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${item.title}"?\n\nThis permanently removes this note from Lesson Content.`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    try {
      const result =
        await apiRequest(
          `/lesson-contents/${item.id}`,
          {
            method: "DELETE",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete note.",
        );
      }

      setItems((current) =>
        current.filter(
          (note) => note.id !== item.id,
        ),
      );

      toast.success("Note deleted.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete note.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Notes"
      description="Revision notes and study material published to learners."
      showNotice={false}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total notes"
          value={String(items.length)}
          hint="Real note resources"
          tone="primary"
        />

        <StatCard
          label="Uploaded files"
          value={String(fileCount)}
          hint="PDF or document notes"
          tone="success"
        />

        <StatCard
          label="Inline notes"
          value={String(inlineCount)}
          hint="Text-based notes"
          tone="primary"
        />

        <StatCard
          label="Active"
          value={String(activeCount)}
          hint={`${items.length - activeCount} inactive`}
          tone="success"
        />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-3xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search notes or lessons..."
                className="pl-9"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">
                All types
              </option>

              {contentTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {formatType(type)}
                </option>
              ))}
            </select>

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

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() =>
                void loadNotes()
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

            <Button onClick={addNote}>
              <Plus className="size-4" />
              New note
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">
                Notes library
              </h2>

              <p className="text-sm text-muted-foreground">
                {filteredItems.length} of{" "}
                {items.length} notes
              </p>
            </div>

            <FileText className="size-5 text-muted-foreground" />
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
              Loading notes...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
              <FileText className="size-8 text-muted-foreground" />

              <div>
                <p className="font-medium">
                  No notes found
                </p>

                <p className="text-sm text-muted-foreground">
                  Create Lesson Content and choose
                  Resource category = Note.
                </p>
              </div>

              <Button onClick={addNote}>
                New note
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">
                      Note
                    </th>

                    <th className="px-5 py-3">
                      Lesson
                    </th>

                    <th className="px-5 py-3">
                      Type
                    </th>

                    <th className="px-5 py-3">
                      Source
                    </th>

                    <th className="px-5 py-3">
                      Access
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    <th className="px-5 py-3">
                      Updated
                    </th>

                    <th className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {item.title}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {item.lesson?.title ??
                          `Lesson ${item.lesson_id}`}
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant="outline">
                          {formatType(
                            item.content_type,
                          )}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {getSourceLabel(item)}
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant="outline">
                          {item.is_free
                            ? "Free"
                            : "Paid"}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            item.is_active
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {item.is_active
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                        {formatDate(
                          item.updated_at,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              openNote(item)
                            }
                          >
                            <ExternalLink className="size-4" />
                            Open
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              manageNote(item)
                            }
                          >
                            Manage
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={
                              deletingId ===
                              item.id
                            }
                            onClick={() =>
                              void deleteNote(
                                item,
                              )
                            }
                          >
                            <Trash2 className="size-4" />

                            {deletingId ===
                            item.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </PortalPage>
  );
}