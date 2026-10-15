import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ExternalLink,
  FileCode2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { Badge } from "@/components/ui/badge";
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
import { getAuthToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/auth/http";

type SourceType =
  | "external"
  | "html"
  | "zip";

type Chapter = {
  id: number;
  title: string;
};

type Lesson = {
  id: number;
  title: string;
  is_published: boolean;
  chapter?: Chapter | null;
};

type InteractiveApp = {
  id: number;
  lesson_id: number;
  title: string;
  description?: string | null;
  source_type: SourceType;
  file_path?: string | null;
  external_url?: string | null;
  entry_url?: string | null;
  version?: string | null;
  display_order: number;
  is_published: boolean;
  is_active: boolean;
  lesson?: Lesson | null;
};

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

type FormState = {
  lessonId: string;
  title: string;
  description: string;
  sourceType: SourceType;
  externalUrl: string;
  version: string;
  displayOrder: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  lessonId: "",
  title: "",
  description: "",
  sourceType: "external",
  externalUrl: "",
  version: "1.0",
  displayOrder: "1",
  isActive: true,
};

export const Route = createFileRoute(
  "/teacher/interactive-apps",
)({
  component: TeacherInteractiveAppsPage,
});

function TeacherInteractiveAppsPage() {
  const [apps, setApps] =
    useState<InteractiveApp[]>([]);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [file, setFile] =
    useState<File | null>(null);

  const [fileKey, setFileKey] =
    useState(0);

  const draftLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          !lesson.is_published,
      ),
    [lessons],
  );

  const authenticatedFetch =
    useCallback(
      async (
        path: string,
        init: RequestInit = {},
      ) => {
        const token =
          getAuthToken();

        return fetch(
          `${API_BASE_URL}${path}`,
          {
            credentials: "include",
            ...init,
            headers: {
              Accept:
                "application/json",
              "X-Requested-With":
                "XMLHttpRequest",
              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
              ...(init.headers ?? {}),
            },
          },
        );
      },
      [],
    );

  const loadAll =
    useCallback(async () => {
      setLoading(true);

      try {
        const [
          appsResponse,
          lessonsResponse,
        ] = await Promise.all([
          authenticatedFetch(
            "/teacher/interactive-apps",
          ),
          authenticatedFetch(
            "/teacher/lessons",
          ),
        ]);

        const appsPayload =
          await readJson<unknown>(
            appsResponse,
          );

        const lessonsPayload =
          await readJson<unknown>(
            lessonsResponse,
          );

        if (!appsResponse.ok) {
          throw new Error(
            errorMessage(
              appsPayload,
              "Unable to load interactive apps.",
            ),
          );
        }

        if (!lessonsResponse.ok) {
          throw new Error(
            errorMessage(
              lessonsPayload,
              "Unable to load lessons.",
            ),
          );
        }

        setApps(
          normalizeApps(
            appsPayload,
          ),
        );

        setLessons(
          normalizeLessons(
            lessonsPayload,
          ),
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load interactive apps.",
        );
      } finally {
        setLoading(false);
      }
    }, [authenticatedFetch]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  function updateForm(
    patch: Partial<FormState>,
  ) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setFileKey(
      (value) => value + 1,
    );
  }

  function createApp() {
    resetForm();

    if (draftLessons[0]) {
      setForm({
        ...emptyForm,
        lessonId: String(
          draftLessons[0].id,
        ),
      });
    }

    setShowForm(true);
  }

  function editApp(
    app: InteractiveApp,
  ) {
    const locked =
      app.is_published ||
      Boolean(
        app.lesson?.is_published,
      );

    if (locked) {
      toast.error(
        "Published content is read-only.",
      );
      return;
    }

    setEditingId(app.id);

    setForm({
      lessonId: String(
        app.lesson_id,
      ),
      title: app.title,
      description:
        app.description ?? "",
      sourceType:
        app.source_type,
      externalUrl:
        app.external_url ?? "",
      version:
        app.version ?? "1.0",
      displayOrder: String(
        app.display_order ?? 1,
      ),
      isActive:
        app.is_active,
    });

    setFile(null);

    setFileKey(
      (value) => value + 1,
    );

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelForm() {
    resetForm();
    setShowForm(false);
  }

  async function saveApp() {
    if (!form.lessonId) {
      toast.error(
        "Select a lesson.",
      );
      return;
    }

    if (!form.title.trim()) {
      toast.error(
        "Enter an app title.",
      );
      return;
    }

    if (
      form.sourceType ===
        "external" &&
      !form.externalUrl.trim()
    ) {
      toast.error(
        "Enter an external URL.",
      );
      return;
    }

    if (
      editingId === null &&
      form.sourceType !==
        "external" &&
      !file
    ) {
      toast.error(
        "Choose an HTML or ZIP file.",
      );
      return;
    }

    const data =
      new FormData();

    data.append(
      "lesson_id",
      form.lessonId,
    );

    data.append(
      "title",
      form.title.trim(),
    );

    data.append(
      "description",
      form.description.trim(),
    );

    data.append(
      "source_type",
      form.sourceType,
    );

    if (
      form.sourceType ===
      "external"
    ) {
      data.append(
        "external_url",
        form.externalUrl.trim(),
      );
    }

    data.append(
      "version",
      form.version.trim() ||
        "1.0",
    );

    data.append(
      "display_order",
      form.displayOrder || "1",
    );

    data.append(
      "is_active",
      form.isActive
        ? "1"
        : "0",
    );

    if (file) {
      data.append(
        "file",
        file,
      );
    }

    if (editingId !== null) {
      data.append(
        "_method",
        "PUT",
      );
    }

    setBusy(true);

    try {
      const path =
        editingId === null
          ? "/teacher/interactive-apps"
          : `/teacher/interactive-apps/${editingId}`;

      const response =
        await authenticatedFetch(
          path,
          {
            method: "POST",
            body: data,
          },
        );

      const payload =
        await readJson<unknown>(
          response,
        );

      if (!response.ok) {
        throw new Error(
          errorMessage(
            payload,
            "Unable to save interactive app.",
          ),
        );
      }

      toast.success(
        editingId === null
          ? "Interactive app created."
          : "Interactive app updated.",
      );

      cancelForm();

      await loadAll();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save interactive app.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeApp(
    app: InteractiveApp,
  ) {
    const locked =
      app.is_published ||
      Boolean(
        app.lesson?.is_published,
      );

    if (locked) {
      toast.error(
        "Published content is read-only.",
      );
      return;
    }

    if (
      !window.confirm(
        `Delete "${app.title}"?`,
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      const response =
        await authenticatedFetch(
          `/teacher/interactive-apps/${app.id}`,
          {
            method: "DELETE",
          },
        );

      const payload =
        await readJson<unknown>(
          response,
        );

      if (!response.ok) {
        throw new Error(
          errorMessage(
            payload,
            "Unable to delete interactive app.",
          ),
        );
      }

      toast.success(
        "Interactive app deleted.",
      );

      await loadAll();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete interactive app.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalPage
      portalLabel="Teacher"
      portalPath="/teacher"
      title="Interactive Apps"
      description="Create interactive learning apps for your own draft lessons."
      showNotice={false}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={createApp}
          disabled={
            busy ||
            draftLessons.length ===
              0
          }
        >
          <Plus className="mr-2 size-4" />
          New interactive app
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            void loadAll()
          }
          disabled={
            loading || busy
          }
        >
          <RefreshCw
            className={
              loading
                ? "mr-2 size-4 animate-spin"
                : "mr-2 size-4"
            }
          />
          Refresh
        </Button>

        {draftLessons.length ===
          0 && (
          <p className="text-sm text-muted-foreground">
            Create a draft lesson
            before adding an
            interactive app.
          </p>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>
                {editingId === null
                  ? "New interactive app"
                  : "Edit interactive app"}
              </CardTitle>

              <Button
                variant="ghost"
                size="icon"
                onClick={cancelForm}
                disabled={busy}
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Lesson
                </Label>

                <select
                  value={
                    form.lessonId
                  }
                  onChange={(event) =>
                    updateForm({
                      lessonId:
                        event.target
                          .value,
                    })
                  }
                  disabled={busy}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">
                    Select lesson
                  </option>

                  {draftLessons.map(
                    (lesson) => (
                      <option
                        key={
                          lesson.id
                        }
                        value={
                          lesson.id
                        }
                      >
                        {
                          lesson.title
                        }
                        {lesson.chapter
                          ?.title
                          ? ` — ${lesson.chapter.title}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  Title
                </Label>

                <Input
                  value={
                    form.title
                  }
                  maxLength={255}
                  disabled={busy}
                  onChange={(event) =>
                    updateForm({
                      title:
                        event.target
                          .value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Description
              </Label>

              <Textarea
                rows={3}
                value={
                  form.description
                }
                disabled={busy}
                onChange={(event) =>
                  updateForm({
                    description:
                      event.target
                        .value,
                  })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Source type
                </Label>

                <select
                  value={
                    form.sourceType
                  }
                  disabled={busy}
                  onChange={(event) => {
                    updateForm({
                      sourceType:
                        event.target
                          .value as SourceType,
                    });

                    setFile(null);

                    setFileKey(
                      (value) =>
                        value + 1,
                    );
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="external">
                    External URL
                  </option>

                  <option value="html">
                    HTML file
                  </option>

                  <option value="zip">
                    ZIP package
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  Version
                </Label>

                <Input
                  value={
                    form.version
                  }
                  maxLength={50}
                  disabled={busy}
                  onChange={(event) =>
                    updateForm({
                      version:
                        event.target
                          .value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Display order
                </Label>

                <Input
                  type="number"
                  min={1}
                  max={65535}
                  value={
                    form.displayOrder
                  }
                  disabled={busy}
                  onChange={(event) =>
                    updateForm({
                      displayOrder:
                        event.target
                          .value,
                    })
                  }
                />
              </div>
            </div>

            {form.sourceType ===
            "external" ? (
              <div className="space-y-2">
                <Label>
                  External URL
                </Label>

                <Input
                  type="url"
                  placeholder="https://example.com/app"
                  value={
                    form.externalUrl
                  }
                  disabled={busy}
                  onChange={(event) =>
                    updateForm({
                      externalUrl:
                        event.target
                          .value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>
                  {form.sourceType ===
                  "html"
                    ? "HTML file"
                    : "ZIP package"}
                </Label>

                <Input
                  key={fileKey}
                  type="file"
                  accept={
                    form.sourceType ===
                    "html"
                      ? ".html,.htm"
                      : ".zip"
                  }
                  disabled={busy}
                  onChange={(event) =>
                    setFile(
                      event.target
                        .files?.[0] ??
                        null,
                    )
                  }
                />

                <p className="text-xs text-muted-foreground">
                  {editingId === null
                    ? "A file is required. ZIP packages must contain index.html."
                    : "Leave empty to keep the existing file when the source type is unchanged."}
                </p>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={
                  form.isActive
                }
                disabled={busy}
                onChange={(event) =>
                  updateForm({
                    isActive:
                      event.target
                        .checked,
                  })
                }
              />

              Active
            </label>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  void saveApp()
                }
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}

                {editingId === null
                  ? "Create app"
                  : "Save changes"}
              </Button>

              <Button
                variant="outline"
                onClick={cancelForm}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Teacher-created apps
              remain drafts. Teachers
              cannot directly publish
              them.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading interactive apps...
        </div>
      ) : apps.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No interactive apps have
            been created yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => {
            const locked =
              app.is_published ||
              Boolean(
                app.lesson
                  ?.is_published,
              );

            return (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode2 className="size-5" />
                        {app.title}
                      </CardTitle>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {app.lesson
                          ?.title ??
                          `Lesson ${app.lesson_id}`}
                      </p>
                    </div>

                    <Badge
                      variant={
                        app.is_published
                          ? "default"
                          : "secondary"
                      }
                    >
                      {app.is_published
                        ? "Published"
                        : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {app.description && (
                    <p className="text-sm text-muted-foreground">
                      {
                        app.description
                      }
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {app.source_type.toUpperCase()}
                    </Badge>

                    <Badge variant="outline">
                      v
                      {app.version ??
                        "1.0"}
                    </Badge>

                    <Badge variant="outline">
                      {app.is_active
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>

                  {locked && (
                    <p className="text-xs text-muted-foreground">
                      Published content
                      is read-only.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {app.entry_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          app.source_type === "external"
                            ? window.open(app.entry_url!, "_blank", "noopener,noreferrer")
                            : window.location.assign(app.entry_url!)
                        }
                      >
                        <ExternalLink className="mr-2 size-4" />
                        Open
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        busy ||
                        locked
                      }
                      onClick={() =>
                        editApp(app)
                      }
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={
                        busy ||
                        locked
                      }
                      onClick={() =>
                        void removeApp(
                          app,
                        )
                      }
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}

async function readJson<T>(
  response: Response,
): Promise<T> {
  const raw =
    await response.text();

  const clean = raw
    .replace(
      /^[\uFEFF\u200B]+/,
      "",
    )
    .trim();

  if (!clean) {
    return {} as T;
  }

  return JSON.parse(
    clean,
  ) as T;
}

function normalizeApps(
  payload: unknown,
): InteractiveApp[] {
  if (Array.isArray(payload)) {
    return payload as InteractiveApp[];
  }

  if (
    payload &&
    typeof payload === "object"
  ) {
    const value =
      payload as {
        data?: unknown;
        apps?: unknown;
      };

    if (
      Array.isArray(value.apps)
    ) {
      return value.apps as InteractiveApp[];
    }

    if (
      Array.isArray(value.data)
    ) {
      return value.data as InteractiveApp[];
    }
  }

  return [];
}

function normalizeLessons(
  payload: unknown,
): Lesson[] {
  if (Array.isArray(payload)) {
    return payload as Lesson[];
  }

  if (
    payload &&
    typeof payload === "object"
  ) {
    const value =
      payload as {
        data?: unknown;
        lessons?: unknown;
      };

    if (
      Array.isArray(
        value.lessons,
      )
    ) {
      return value.lessons as Lesson[];
    }

    if (
      Array.isArray(value.data)
    ) {
      return value.data as Lesson[];
    }

    if (
      value.data &&
      typeof value.data ===
        "object"
    ) {
      const nested =
        value.data as {
          lessons?: unknown;
        };

      if (
        Array.isArray(
          nested.lessons,
        )
      ) {
        return nested.lessons as Lesson[];
      }
    }
  }

  return [];
}

function errorMessage(
  payload: unknown,
  fallback: string,
) {
  if (
    payload &&
    typeof payload === "object"
  ) {
    const error =
      payload as ApiError;

    if (error.message) {
      return error.message;
    }

    if (error.errors) {
      const first =
        Object.values(
          error.errors,
        )[0]?.[0];

      if (first) {
        return first;
      }
    }
  }

  return fallback;
}