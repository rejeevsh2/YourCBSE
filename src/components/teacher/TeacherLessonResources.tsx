import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/auth/http";

type ContentType =
  | "text"
  | "video"
  | "worksheet"
  | "image";

type LessonContent = {
  id: number;
  title: string;
  content_type: string;
  content: string | null;
  external_url: string | null;
  display_order?: number;
};

type Lesson = {
  id: number;
  title: string;
  is_published: boolean;
  chapter?: {
    id?: number;
    title?: string;
  } | null;
  contents: LessonContent[];
};

type LessonResponse = {
  lesson?: Lesson;
  lessons?: Lesson[];
  message?: string;
};

type Props = {
  title: string;
  description: string;
  singularLabel: string;
  contentType: ContentType;
  contentLabel: string;
  contentPlaceholder: string;
  urlPlaceholder?: string;
};

export function TeacherLessonResources({
  title,
  description,
  singularLabel,
  contentType,
  contentLabel,
  contentPlaceholder,
  urlPlaceholder = "https://...",
}: Props) {
  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [selectedLessonId, setSelectedLessonId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [titleValue, setTitleValue] =
    useState("");

  const [body, setBody] =
    useState("");

  const [externalUrl, setExternalUrl] =
    useState("");

  async function loadLessons() {
    setLoading(true);

    const result =
      await apiRequest<LessonResponse>(
        "/teacher/lessons",
        {
          method: "GET",
        },
      );

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to load teacher lessons.",
      );

      setLoading(false);
      return;
    }

    const loaded =
      result.data?.lessons ?? [];

    setLessons(loaded);

    setSelectedLessonId(
      (current) =>
        current ??
        loaded[0]?.id ??
        null,
    );

    setLoading(false);
  }

  useEffect(() => {
    void loadLessons();
  }, []);

  const selectedLesson =
    useMemo(
      () =>
        lessons.find(
          (lesson) =>
            lesson.id ===
            selectedLessonId,
        ) ?? null,
      [lessons, selectedLessonId],
    );

  const resources =
    useMemo(
      () =>
        (selectedLesson?.contents ?? [])
          .filter(
            (item) =>
              item.content_type ===
              contentType,
          )
          .sort(
            (a, b) =>
              (a.display_order ?? 0) -
              (b.display_order ?? 0),
          ),
      [selectedLesson, contentType],
    );

  function resetForm() {
    setEditingId(null);
    setTitleValue("");
    setBody("");
    setExternalUrl("");
  }

  function startEdit(
    item: LessonContent,
  ) {
    setEditingId(item.id);
    setTitleValue(item.title);
    setBody(item.content ?? "");
    setExternalUrl(
      item.external_url ?? "",
    );
  }

  function replaceLesson(
    lesson: Lesson,
  ) {
    setLessons((current) =>
      current.map((item) =>
        item.id === lesson.id
          ? lesson
          : item,
      ),
    );
  }

  async function saveResource(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!selectedLesson) {
      toast.error(
        "Select a lesson first.",
      );
      return;
    }

    if (selectedLesson.is_published) {
      toast.error(
        "Published lessons must be unpublished by an administrator before editing.",
      );
      return;
    }

    if (
      !body.trim() &&
      !externalUrl.trim()
    ) {
      toast.error(
        "Enter content or a resource URL.",
      );
      return;
    }

    setSaving(true);

    const endpoint =
      editingId === null
        ? `/teacher/lessons/${selectedLesson.id}/contents`
        : `/teacher/lessons/${selectedLesson.id}/contents/${editingId}`;

    const result =
      await apiRequest<LessonResponse>(
        endpoint,
        {
          method:
            editingId === null
              ? "POST"
              : "PUT",
          body: {
            title:
              titleValue.trim(),
            content_type:
              contentType,
            content:
              body.trim() || null,
            external_url:
              externalUrl.trim() ||
              null,
          },
        },
      );

    if (
      result.ok &&
      result.data?.lesson
    ) {
      replaceLesson(
        result.data.lesson,
      );

      resetForm();

      toast.success(
        editingId === null
          ? `${singularLabel} added.`
          : `${singularLabel} updated.`,
      );
    } else {
      toast.error(
        result.message ??
          `Unable to save ${singularLabel.toLowerCase()}.`,
      );
    }

    setSaving(false);
  }

  async function removeResource(
    item: LessonContent,
  ) {
    if (!selectedLesson) {
      return;
    }

    if (selectedLesson.is_published) {
      toast.error(
        "Published lessons cannot be edited.",
      );
      return;
    }

    if (
      !window.confirm(
        `Delete "${item.title}"?`,
      )
    ) {
      return;
    }

    setDeletingId(item.id);

    const result =
      await apiRequest<LessonResponse>(
        `/teacher/lessons/${selectedLesson.id}/contents/${item.id}`,
        {
          method: "DELETE",
        },
      );

    if (
      result.ok &&
      result.data?.lesson
    ) {
      replaceLesson(
        result.data.lesson,
      );

      if (editingId === item.id) {
        resetForm();
      }

      toast.success(
        `${singularLabel} deleted.`,
      );
    } else {
      toast.error(
        result.message ??
          `Unable to delete ${singularLabel.toLowerCase()}.`,
      );
    }

    setDeletingId(null);
  }

  return (
    <PortalPage
      portalLabel="Teacher"
      portalPath="/teacher"
      title={title}
      description={description}
      showNotice={false}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            Lesson
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading lessons...
            </div>
          ) : lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Create a lesson first before adding resources.
            </p>
          ) : (
            <select
              className="w-full rounded-lg border bg-background p-2 sm:max-w-xl"
              value={
                selectedLessonId ?? ""
              }
              onChange={(event) => {
                setSelectedLessonId(
                  Number(
                    event.target.value,
                  ),
                );

                resetForm();
              }}
            >
              {lessons.map(
                (lesson) => (
                  <option
                    key={lesson.id}
                    value={lesson.id}
                  >
                    {lesson.title}
                    {lesson.chapter?.title
                      ? ` - ${lesson.chapter.title}`
                      : ""}
                    {lesson.is_published
                      ? " (Published)"
                      : ""}
                  </option>
                ),
              )}
            </select>
          )}
        </CardContent>
      </Card>

      {selectedLesson ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <Card>
            <CardHeader>
              <CardTitle>
                {title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {resources.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="font-medium">
                    No {title.toLowerCase()} yet
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Add the first resource to this lesson.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium">
                              {item.title}
                            </p>

                            {item.external_url ? (
                              <p className="mt-1 break-all text-xs text-muted-foreground">
                                {
                                  item.external_url
                                }
                              </p>
                            ) : null}

                            {item.content ? (
                              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                {
                                  item.content
                                }
                              </p>
                            ) : null}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                selectedLesson.is_published
                              }
                              onClick={() =>
                                startEdit(
                                  item,
                                )
                              }
                            >
                              <Pencil className="size-4" />
                              Edit
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={
                                selectedLesson.is_published ||
                                deletingId ===
                                  item.id
                              }
                              onClick={() => {
                                void removeResource(
                                  item,
                                );
                              }}
                            >
                              {deletingId ===
                              item.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}

                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  {editingId === null
                    ? `Add ${singularLabel}`
                    : `Edit ${singularLabel}`}
                </CardTitle>

                {editingId !== null ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={resetForm}
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>
            </CardHeader>

            <CardContent>
              {selectedLesson.is_published ? (
                <p className="rounded-xl border p-4 text-sm text-muted-foreground">
                  This lesson is published. Ask an administrator to unpublish it before editing its resources.
                </p>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={saveResource}
                >
                  <div className="space-y-2">
                    <Label htmlFor="resource-title">
                      Title
                    </Label>

                    <Input
                      id="resource-title"
                      required
                      value={
                        titleValue
                      }
                      onChange={(event) =>
                        setTitleValue(
                          event.target
                            .value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource-body">
                      {contentLabel}
                    </Label>

                    <Textarea
                      id="resource-body"
                      rows={7}
                      value={body}
                      placeholder={
                        contentPlaceholder
                      }
                      onChange={(event) =>
                        setBody(
                          event.target
                            .value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource-url">
                      Resource URL
                    </Label>

                    <Input
                      id="resource-url"
                      type="url"
                      value={
                        externalUrl
                      }
                      placeholder={
                        urlPlaceholder
                      }
                      onChange={(event) =>
                        setExternalUrl(
                          event.target
                            .value,
                        )
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : editingId ===
                      null ? (
                      <Plus className="size-4" />
                    ) : (
                      <Save className="size-4" />
                    )}

                    {saving
                      ? "Saving..."
                      : editingId ===
                          null
                        ? `Add ${singularLabel}`
                        : "Save changes"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PortalPage>
  );
}