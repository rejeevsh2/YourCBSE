import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Upload,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/lesson-contents")({
  validateSearch: (search: Record<string, unknown>) => ({
    lesson:
      typeof search.lesson === "number"
        ? search.lesson
        : typeof search.lesson === "string" && search.lesson !== ""
          ? Number(search.lesson)
          : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Lesson Content — YourSchool Admin" },
      {
        name: "description",
        content: "Create and manage lesson content.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLessonContentsPage,
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
  lesson?: Lesson;
};

type FormState = {
  lesson_id: string;
  title: string;
  content_type: string;
  resource_category: string;
  content: string;
  external_url: string;
  display_order: string;
  is_free: boolean;
  is_active: boolean;
};

const emptyForm: FormState = {
  lesson_id: "",
  title: "",
  content_type: "text",
resource_category: "",
content: "",
  external_url: "",
  display_order: "1",
  is_free: false,
  is_active: true,
};

function getToken() {
  return (
    localStorage.getItem("yourcbse.auth.token") ||
    sessionStorage.getItem("yourcbse.auth.token") ||
    ""
  );
}

function AdminLessonContentsPage() {
  const { lesson: selectedLessonId } = Route.useSearch();

  const [items, setItems] = useState<LessonContent[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const selectedLesson = lessons.find(
    (lesson) =>
      Number(lesson.id) === Number(selectedLessonId),
  );  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [removingFileId, setRemovingFileId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [existingFile, setExistingFile] =
    useState<string | null>(null);

  const API = API_BASE_URL;

  const token = useMemo(() => getToken(), []);

  async function apiFetch(
    url: string,
    options: RequestInit = {},
  ) {
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`,
      );
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  async function loadData() {
    setLoading(true);

    try {
      const [contentResponse, lessonResponse] =
        await Promise.all([
          apiFetch(`${API}/lesson-contents`),
          apiFetch(`${API}/lessons`),
        ]);

      if (!contentResponse.ok) {
        throw new Error(
          "Could not load lesson contents.",
        );
      }

      if (!lessonResponse.ok) {
        throw new Error(
          "Could not load lessons.",
        );
      }

      const contentData =
        await contentResponse.json();

      const lessonData =
        await lessonResponse.json();

      const allItems: LessonContent[] = Array.isArray(contentData)
  ? contentData
  : contentData.data ?? [];

const allLessons: Lesson[] = Array.isArray(lessonData)
  ? lessonData
  : lessonData.data ?? [];

setLessons(allLessons);

if (selectedLessonId) {
  setItems(
    allItems.filter(
      (item) =>
        Number(item.lesson_id) === Number(selectedLessonId),
    ),
  );
} else {
  setItems(allItems);
}
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load lesson content.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  void loadData();
}, [selectedLessonId]);

  function openCreate() {
  setEditingId(null);

  setForm({
    ...emptyForm,
    lesson_id: selectedLessonId
      ? String(selectedLessonId)
      : "",
  });

  setSelectedFile(null);
  setExistingFile(null);
  setShowForm(true);
}

  function openEdit(item: LessonContent) {
    setEditingId(item.id);

    setForm({
      lesson_id: String(item.lesson_id),
      title: item.title ?? "",
     content_type:
  item.content_type ?? "text",
resource_category:
  item.resource_category ?? "",
content: item.content ?? "",
      external_url:
        item.external_url ?? "",
      display_order: String(
        item.display_order ?? 1,
      ),
      is_free: Boolean(item.is_free),
      is_active: Boolean(item.is_active),
    });

    setExistingFile(item.file_path ?? null);
    setSelectedFile(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setExistingFile(null);
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!form.lesson_id) {
      toast.error("Please select a lesson.");
      return;
    }

    if (!form.title.trim()) {
      toast.error(
        "Please enter a content title.",
      );
      return;
    }

    setSaving(true);

    try {
      const body = new FormData();

      body.append(
        "lesson_id",
        form.lesson_id,
      );
if (form.resource_category) {
  body.append(
    "resource_category",
    form.resource_category,
  );
}

      body.append(
        "title",
        form.title.trim(),
      );

      body.append(
        "content_type",
        form.content_type,
      );

      if (form.content.trim()) {
        body.append(
          "content",
          form.content.trim(),
        );
      }

      if (form.external_url.trim()) {
        body.append(
          "external_url",
          form.external_url.trim(),
        );
      }

      body.append(
        "display_order",
        form.display_order || "1",
      );

      body.append(
        "is_free",
        form.is_free ? "1" : "0",
      );

      body.append(
        "is_active",
        form.is_active ? "1" : "0",
      );

      if (selectedFile) {
        body.append("file", selectedFile);
      }

      /*
       * Browsers/PHP handle multipart PUT
       * inconsistently. For editing, send POST
       * and tell Laravel to treat it as PUT.
       */
      if (editingId) {
        body.append("_method", "PUT");
      }

      const url = editingId
        ? `${API}/lesson-contents/${editingId}`
        : `${API}/lesson-contents`;

      const response = await apiFetch(url, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        console.error(data);

        if (data?.errors) {
          const firstError = Object.values(
            data.errors,
          )
            .flat()
            .find(Boolean);

          if (firstError) {
            throw new Error(
              String(firstError),
            );
          }
        }

        throw new Error(
          data?.message ||
            "Could not save lesson content.",
        );
      }

      toast.success(
        editingId
          ? "Lesson content updated."
          : "Lesson content created.",
      );

      closeForm();
      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save lesson content.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: LessonContent) {
    if (deletingId !== null || removingFileId !== null) return;
    if (!window.confirm(
      `Delete "${item.title}" from this lesson?\n\nIts uploaded file, if any, will also be deleted. External links will be removed from YourSchool without deleting the original YouTube or Drive resource.`,
    )) return;

    setDeletingId(item.id);
    try {
      const response = await apiFetch(`${API}/lesson-contents/${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "Could not delete lesson content.");
      }
      if (editingId === item.id) closeForm();
      toast.success("Lesson content deleted.");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not delete lesson content.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRemoveFile(item: LessonContent) {
    if (!item.file_path || deletingId !== null || removingFileId !== null) return;
    if (!window.confirm(
      `Remove the uploaded file from "${item.title}"?\n\nThe lesson content, description, and any external link will remain.`,
    )) return;

    setRemovingFileId(item.id);
    try {
      const response = await apiFetch(`${API}/lesson-contents/${item.id}/file`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "Could not remove the uploaded file.");
      }
      if (editingId === item.id) setExistingFile(null);
      toast.success("Uploaded file removed. Lesson content preserved.");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not remove the file.");
    } finally {
      setRemovingFileId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Lesson Content"
      description="Add PDFs, images, PowerPoint presentations, videos and other resources. Edit or delete each item independently."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
    {selectedLesson ? (
      <div className="mb-1">
        <p className="font-heading text-base font-semibold">
          Managing Content: {selectedLesson.title}
        </p>

        <p className="text-xs text-muted-foreground">
          Lesson ID: {selectedLesson.id}
        </p>
      </div>
    ) : null}

    <p className="text-sm text-muted-foreground">
      {items.length} content item
      {items.length === 1 ? "" : "s"} found
    </p>
  </div>

  <div className="flex gap-2">
    <Button
      type="button"
      variant="outline"
      onClick={() => void loadData()}
      disabled={loading}
    >
      <RefreshCw className="mr-2 size-4" />
      Refresh
    </Button>

    <Button
      type="button"
      onClick={openCreate}
    >
      <Plus className="mr-2 size-4" />
      New content
    </Button>
  </div>
</div>

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border bg-card p-5 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                {editingId
                  ? "Edit lesson content"
                  : "Create lesson content"}
              </h2>

              <p className="text-sm text-muted-foreground">
                Add lesson text, external media
                or upload a file directly.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lesson">
                  Lesson
                </Label>

                <select
                  id="lesson"
                  value={form.lesson_id}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lesson_id:
                        event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="">
                    Select lesson
                  </option>

                  {lessons.map((lesson) => (
                    <option
                      key={lesson.id}
                      value={lesson.id}
                    >
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Content title
                </Label>

                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title:
                        event.target.value,
                    })
                  }
                  placeholder="Introduction"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-type">
                  Content type
                </Label>

                <select
                  id="content-type"
                  value={form.content_type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      content_type:
                        event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="text">
                    Text
                  </option>

                  <option value="video">
                    Video
                  </option>

                  <option value="pdf">
                    PDF
                  </option>

                  <option value="ppt">
                    PowerPoint (PPT / PPTX)
                  </option>

                  <option value="image">
                    Image
                  </option>

                  <option value="audio">
                    Audio
                  </option>

                  <option value="quiz">
                    Quiz
                  </option>

                  <option value="worksheet">
                    Worksheet
                  </option>

                  <option value="activity">
                    Activity
                  </option>
                </select>
              </div>

              <div className="space-y-2">
  <Label htmlFor="resource-category">
    Resource category
  </Label>

  <select
    id="resource-category"
    value={form.resource_category}
    onChange={(event) =>
      setForm({
        ...form,
        resource_category: event.target.value,
      })
    }
    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
  >
    <option value="">
      Normal lesson content
    </option>

    <option value="note">
      Note
    </option>


    <option value="mind_map">
      Mind Map
    </option>
  </select>

  <p className="text-xs text-muted-foreground">
    Optional. Select a category only when this content should also appear in a specialist resource library.
  </p>
</div>

<div className="space-y-2">
  <Label htmlFor="display-order">
    Display order
  </Label>

  <Input
    id="display-order"
    type="number"
    min="1"
    value={form.display_order}
    onChange={(event) =>
      setForm({
        ...form,
        display_order: event.target.value,
      })
    }
  />
</div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="content">
                  Content / Description
                </Label>

                <textarea
                  id="content"
                  value={form.content}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      content:
                        event.target.value,
                    })
                  }
                  placeholder="Enter lesson text, instructions or description..."
                  rows={7}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external-url">
                  External URL
                </Label>

                <Input
                  id="external-url"
                  type="url"
                  value={form.external_url}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      external_url:
                        event.target.value,
                    })
                  }
                  placeholder="YouTube or external resource URL"
                />

                <p className="text-xs text-muted-foreground">
                  Optional. Use this for YouTube
                  videos or externally hosted files.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">
                  Upload file (PDF, image, PowerPoint or video)
                </Label>

                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.mp3,.wav,.ogg,.m4a,.mp4,.webm,.mov,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    if (!file) return;
                    const extension = file.name.toLowerCase().split(".").pop();
                    const newType = extension === "ppt" || extension === "pptx"
                      ? "ppt"
                      : extension === "pdf" ? "pdf"
                      : ["jpg", "jpeg", "png", "gif", "webp"].includes(extension ?? "") ? "image"
                      : ["mp4", "webm", "mov"].includes(extension ?? "") ? "video"
                      : null;
                    if (newType) {
                      setForm((current) => ({ ...current, content_type: newType }));
                    }
                  }
                />

                <p className="text-xs text-muted-foreground">
                  PDF, image, audio, video, PowerPoint (.ppt/.pptx),
                  worksheet or document. Maximum size: 100 MB.
                  Presentations open or download in a compatible viewer.
                </p>

                {selectedFile ? (
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <Upload className="size-4" />

                      <span className="text-sm font-medium">
                        {selectedFile.name}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                ) : null}

                {selectedFile ? (
                  <Button type="button" size="sm" variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      const input = document.getElementById("file") as HTMLInputElement | null;
                      if (input) input.value = "";
                    }}
                  >Clear selected file</Button>
                ) : null}

                {!selectedFile &&
                existingFile ? (
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4" />

                      <span className="text-sm">
                        Current uploaded file
                      </span>
                    </div>

                    <a
                      href={existingFile}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium underline"
                    >
                      Open current file
                      <ExternalLink className="size-3" />
                    </a>
                    {editingId ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="mt-3"
                        disabled={deletingId !== null || removingFileId !== null}
                        onClick={() => {
                          const item = items.find((entry) => entry.id === editingId);
                          if (item) void handleRemoveFile(item);
                        }}
                      >
                        <Trash2 className="size-4" />
                        {removingFileId === editingId ? "Removing..." : "Remove uploaded file"}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_free}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_free:
                        event.target.checked,
                    })
                  }
                />

                Free content
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_active:
                        event.target.checked,
                    })
                  }
                />

                Active
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 size-4 animate-spin" />
                    Uploading...
                  </>
                ) : editingId ? (
                  "Save changes"
                ) : (
                  <>
                    <Upload className="mr-2 size-4" />
                    Create content
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : null}


        {/* Mobile cards show Delete next to the resource, not off-screen
            in the last column of a wide table. */}
        {!loading && items.length > 0 ? (
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border bg-card p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.lesson?.title ?? `Lesson ${item.lesson_id}`} · {item.content_type === "ppt" ? "PowerPoint" : item.content_type.toUpperCase()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.file_path || item.external_url ? (
                    <Button type="button" size="sm" variant="outline" asChild>
                      <a href={item.file_path || item.external_url || "#"} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" />
                        {item.file_path ? "Open file" : "Open link"}
                      </a>
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="outline" onClick={() => openEdit(item)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  {item.file_path ? (
                    <Button type="button" size="sm" variant="outline"
                      disabled={deletingId !== null || removingFileId !== null}
                      onClick={() => void handleRemoveFile(item)}>
                      <Trash2 className="size-4" />
                      {removingFileId === item.id ? "Removing..." : "Remove file"}
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="destructive"
                    disabled={deletingId !== null || removingFileId !== null}
                    onClick={() => void handleDelete(item)}>
                    <Trash2 className="size-4" />
                    {deletingId === item.id ? "Deleting..." : "Delete content"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && items.length === 0 ? (
          <p className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground lg:hidden">
            No lesson content yet. Click New content to add a PDF, presentation, image or video.
          </p>
        ) : null}

        <div className="hidden overflow-hidden rounded-3xl border bg-card lg:block">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading lesson content...
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold">
                No lesson content yet
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first lesson content
                item.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Title
                    </th>

                    <th className="px-4 py-3 text-left">
                      Lesson
                    </th>

                    <th className="px-4 py-3 text-left">
                      Type
                    </th>

                    <th className="px-4 py-3 text-left">
                      Order
                    </th>

                    <th className="px-4 py-3 text-left">
                      File
                    </th>

                    <th className="px-4 py-3 text-left">
                      Access
                    </th>

                    <th className="px-4 py-3 text-left">
                      Status
                    </th>

                    <th className="sticky right-0 z-10 min-w-[185px] bg-muted px-4 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {item.title}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          ID: {item.id}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {item.lesson?.title ??
                          `Lesson ${item.lesson_id}`}
                      </td>

                      <td className="px-4 py-4 capitalize">
                        {item.content_type === "ppt" ? "PowerPoint" : item.content_type}
                      </td>

                      <td className="px-4 py-4">
                        {item.display_order ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {item.file_path ? (
                          <a
                            href={
                              item.file_path
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium underline"
                          >
                            Open
                            <ExternalLink className="size-3" />
                          </a>
                        ) : item.external_url ? (
                          <span className="text-xs text-muted-foreground">
                            External
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {item.is_free
                          ? "Free"
                          : "Restricted"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            item.is_active
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {item.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="sticky right-0 z-10 bg-card px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openEdit(item)
                            }
                          >
                            <Pencil className="mr-1 size-4" />
                            Edit
                          </Button>

                          {item.file_path ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={deletingId !== null || removingFileId !== null}
                              onClick={() => void handleRemoveFile(item)}
                            >
                              <Trash2 className="size-4" />
                              {removingFileId === item.id ? "Removing..." : "Remove file"}
                            </Button>
                          ) : null}

                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={deletingId !== null || removingFileId !== null}
                            onClick={() => void handleDelete(item)}
                          >
                            <Trash2 className="mr-1 size-4" />
                            {deletingId === item.id ? "Deleting..." : "Delete content"}
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
      </div>
    </PortalPage>
  );
}

