import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/auth/http";

/* =========================================================
   TYPES
========================================================= */

interface Grade {
  id: number;
  name: string;
  grade_number?: number;
}

interface Subject {
  id: number;
  grade_id: number;
  name: string;
  grade?: Grade;
}

interface Unit {
  id: number;
  subject_id: number;
  title: string;
  unit_number: number;
  subject?: Subject;
}

interface Chapter {
  id: number;
  unit_id: number;
  title: string;
  chapter_number: number;
  unit?: Unit;
}

interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  lesson_number: number;
  chapter?: Chapter;
}

type SourceType = "html" | "zip" | "external";

interface InteractiveApp {
  id: number;
  lesson_id: number;
  title: string;
  description: string | null;
  source_type: SourceType;
  file_path: string | null;
  external_url: string | null;
  entry_url: string | null;
  version: string;
  display_order: number;
  is_published: boolean;
  is_active: boolean;
  lesson?: Lesson;
}

interface AppForm {
  grade_id: number;
  subject_id: number;
  unit_id: number;
  chapter_id: number;
  lesson_id: number;

  title: string;
  description: string;

  source_type: SourceType;

  external_url: string;
  entry_url: string;

  version: string;
  display_order: number;

  is_published: boolean;
  is_active: boolean;
}

const emptyForm: AppForm = {
  grade_id: 0,
  subject_id: 0,
  unit_id: 0,
  chapter_id: 0,
  lesson_id: 0,

  title: "",
  description: "",

  source_type: "external",

  external_url: "",
  entry_url: "",

  version: "1.0",
  display_order: 1,

  is_published: false,
  is_active: true,
};

/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute("/admin/interactive-apps")({
  head: () => ({
    meta: [
      { title: "Interactive Apps — YourSchool Admin" },
      {
        name: "description",
        content: "Create and manage interactive learning apps.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),

  component: AdminInteractiveAppsPage,
});

/* =========================================================
   PAGE
========================================================= */

function AdminInteractiveAppsPage() {
  const [apps, setApps] = useState<InteractiveApp[]>([]);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingApp, setEditingApp] =
    useState<InteractiveApp | null>(null);

  const [form, setForm] = useState<AppForm>(emptyForm);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  /* =======================================================
     AUTH
  ======================================================= */

  const authHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();

    return {
      Accept: "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }, []);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        appsResponse,
        lessonsResponse,
        chaptersResponse,
        unitsResponse,
        subjectsResponse,
        gradesResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/interactive-apps`, {
          headers: authHeaders(),
        }),

        fetch(`${API_BASE_URL}/lessons`, {
          headers: authHeaders(),
        }),

        fetch(`${API_BASE_URL}/chapters`, {
          headers: authHeaders(),
        }),

        fetch(`${API_BASE_URL}/units`, {
          headers: authHeaders(),
        }),

        fetch(`${API_BASE_URL}/subjects`, {
          headers: authHeaders(),
        }),

        fetch(`${API_BASE_URL}/grades`, {
          headers: authHeaders(),
        }),
      ]);

      if (
        appsResponse.status === 401 ||
        appsResponse.status === 403
      ) {
        throw new Error(
          "Your admin session is not authorised.",
        );
      }

      if (!appsResponse.ok) {
        throw new Error(
          `Unable to load interactive apps (${appsResponse.status}).`,
        );
      }

      if (!lessonsResponse.ok) {
        throw new Error(
          `Unable to load lessons (${lessonsResponse.status}).`,
        );
      }

      if (!chaptersResponse.ok) {
        throw new Error(
          `Unable to load chapters (${chaptersResponse.status}).`,
        );
      }

      if (!unitsResponse.ok) {
        throw new Error(
          `Unable to load units (${unitsResponse.status}).`,
        );
      }

      if (!subjectsResponse.ok) {
        throw new Error(
          `Unable to load subjects (${subjectsResponse.status}).`,
        );
      }

      if (!gradesResponse.ok) {
        throw new Error(
          `Unable to load grades (${gradesResponse.status}).`,
        );
      }

      const appsData = await appsResponse.json();
      const lessonsData = await lessonsResponse.json();
      const chaptersData = await chaptersResponse.json();
      const unitsData = await unitsResponse.json();
      const subjectsData = await subjectsResponse.json();
      const gradesData = await gradesResponse.json();

      setApps(
        Array.isArray(appsData)
          ? appsData
          : appsData.data ?? [],
      );

      setLessons(
        Array.isArray(lessonsData)
          ? lessonsData
          : lessonsData.data ?? [],
      );

      setChapters(
        Array.isArray(chaptersData)
          ? chaptersData
          : chaptersData.data ?? [],
      );

      setUnits(
        Array.isArray(unitsData)
          ? unitsData
          : unitsData.data ?? [],
      );

      setSubjects(
        Array.isArray(subjectsData)
          ? subjectsData
          : subjectsData.data ?? [],
      );

      setGrades(
        Array.isArray(gradesData)
          ? gradesData
          : gradesData.data ?? [],
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load interactive apps.",
      );
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* =======================================================
     FILTERS
  ======================================================= */

  const filteredSubjects = useMemo(() => {
    if (!form.grade_id) return [];

    return subjects.filter(
      (subject) => subject.grade_id === form.grade_id,
    );
  }, [subjects, form.grade_id]);

  const filteredUnits = useMemo(() => {
    if (!form.subject_id) return [];

    return units.filter(
      (unit) => unit.subject_id === form.subject_id,
    );
  }, [units, form.subject_id]);

  const filteredChapters = useMemo(() => {
    if (!form.unit_id) return [];

    return chapters.filter(
      (chapter) => chapter.unit_id === form.unit_id,
    );
  }, [chapters, form.unit_id]);

  const filteredLessons = useMemo(() => {
    if (!form.chapter_id) return [];

    return lessons.filter(
      (lesson) => lesson.chapter_id === form.chapter_id,
    );
  }, [lessons, form.chapter_id]);

  /* =======================================================
     CREATE
  ======================================================= */

  function openCreateForm() {
    const firstGrade = grades[0];

    const firstSubject = firstGrade
      ? subjects.find(
          (subject) => subject.grade_id === firstGrade.id,
        )
      : undefined;

    const firstUnit = firstSubject
      ? units.find(
          (unit) => unit.subject_id === firstSubject.id,
        )
      : undefined;

    const firstChapter = firstUnit
      ? chapters.find(
          (chapter) => chapter.unit_id === firstUnit.id,
        )
      : undefined;

    const firstLesson = firstChapter
      ? lessons.find(
          (lesson) => lesson.chapter_id === firstChapter.id,
        )
      : undefined;

    setEditingApp(null);
    setSelectedFile(null);

    setForm({
      ...emptyForm,

      grade_id: firstGrade?.id ?? 0,
      subject_id: firstSubject?.id ?? 0,
      unit_id: firstUnit?.id ?? 0,
      chapter_id: firstChapter?.id ?? 0,
      lesson_id: firstLesson?.id ?? 0,

      display_order: apps.length + 1,
    });

    setShowForm(true);
  }

  /* =======================================================
     EDIT
  ======================================================= */

  function openEditForm(app: InteractiveApp) {
    const lesson =
      lessons.find(
        (item) => item.id === app.lesson_id,
      ) ?? app.lesson;

    const chapter = lesson
      ? chapters.find(
          (item) => item.id === lesson.chapter_id,
        ) ?? lesson.chapter
      : undefined;

    const unit = chapter
      ? units.find(
          (item) => item.id === chapter.unit_id,
        ) ?? chapter.unit
      : undefined;

    const subject = unit
      ? subjects.find(
          (item) => item.id === unit.subject_id,
        ) ?? unit.subject
      : undefined;

    const grade = subject
      ? grades.find(
          (item) => item.id === subject.grade_id,
        ) ?? subject.grade
      : undefined;

    setEditingApp(app);
    setSelectedFile(null);

    setForm({
      grade_id: grade?.id ?? 0,
      subject_id: subject?.id ?? 0,
      unit_id: unit?.id ?? 0,
      chapter_id: chapter?.id ?? 0,
      lesson_id: app.lesson_id,

      title: app.title,

      description: app.description ?? "",

      source_type: app.source_type,

      external_url: app.external_url ?? "",

      entry_url: app.entry_url ?? "",

      version: app.version || "1.0",

      display_order: app.display_order ?? 1,

      is_published: app.is_published,

      is_active: app.is_active,
    });

    setShowForm(true);
  }

  /* =======================================================
     CLOSE
  ======================================================= */

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingApp(null);
    setSelectedFile(null);
    setForm(emptyForm);
  }

  /* =======================================================
     CASCADING CURRICULUM
  ======================================================= */

  function changeGrade(gradeId: number) {
    const firstSubject = subjects.find(
      (subject) => subject.grade_id === gradeId,
    );

    const firstUnit = firstSubject
      ? units.find(
          (unit) => unit.subject_id === firstSubject.id,
        )
      : undefined;

    const firstChapter = firstUnit
      ? chapters.find(
          (chapter) => chapter.unit_id === firstUnit.id,
        )
      : undefined;

    const firstLesson = firstChapter
      ? lessons.find(
          (lesson) => lesson.chapter_id === firstChapter.id,
        )
      : undefined;

    setForm((current) => ({
      ...current,

      grade_id: gradeId,

      subject_id: firstSubject?.id ?? 0,

      unit_id: firstUnit?.id ?? 0,

      chapter_id: firstChapter?.id ?? 0,

      lesson_id: firstLesson?.id ?? 0,
    }));
  }

  function changeSubject(subjectId: number) {
    const firstUnit = units.find(
      (unit) => unit.subject_id === subjectId,
    );

    const firstChapter = firstUnit
      ? chapters.find(
          (chapter) => chapter.unit_id === firstUnit.id,
        )
      : undefined;

    const firstLesson = firstChapter
      ? lessons.find(
          (lesson) => lesson.chapter_id === firstChapter.id,
        )
      : undefined;

    setForm((current) => ({
      ...current,

      subject_id: subjectId,

      unit_id: firstUnit?.id ?? 0,

      chapter_id: firstChapter?.id ?? 0,

      lesson_id: firstLesson?.id ?? 0,
    }));
  }

  function changeUnit(unitId: number) {
    const firstChapter = chapters.find(
      (chapter) => chapter.unit_id === unitId,
    );

    const firstLesson = firstChapter
      ? lessons.find(
          (lesson) => lesson.chapter_id === firstChapter.id,
        )
      : undefined;

    setForm((current) => ({
      ...current,

      unit_id: unitId,

      chapter_id: firstChapter?.id ?? 0,

      lesson_id: firstLesson?.id ?? 0,
    }));
  }

  function changeChapter(chapterId: number) {
    const firstLesson = lessons.find(
      (lesson) => lesson.chapter_id === chapterId,
    );

    setForm((current) => ({
      ...current,

      chapter_id: chapterId,

      lesson_id: firstLesson?.id ?? 0,
    }));
  }

  /* =======================================================
     SOURCE TYPE
  ======================================================= */

  function changeSourceType(sourceType: SourceType) {
    setSelectedFile(null);

    setForm((current) => ({
      ...current,

      source_type: sourceType,

      external_url:
        sourceType === "external"
          ? current.external_url
          : "",
    }));
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function saveApp(event: React.FormEvent) {
    event.preventDefault();

    if (!form.lesson_id) {
      toast.error("Please select a lesson.");
      return;
    }

    if (!form.title.trim()) {
      toast.error("App title is required.");
      return;
    }

    if (
      form.source_type === "external" &&
      !form.external_url.trim()
    ) {
      toast.error("External URL is required.");
      return;
    }

    if (
      !editingApp &&
      (form.source_type === "html" ||
        form.source_type === "zip") &&
      !selectedFile
    ) {
      toast.error(
        `Please choose a ${form.source_type.toUpperCase()} file.`,
      );
      return;
    }

    try {
      setSaving(true);

      const editing = Boolean(editingApp);

      const url = editing
        ? `${API_BASE_URL}/interactive-apps/${editingApp!.id}`
        : `${API_BASE_URL}/interactive-apps`;

      const data = new FormData();

      data.append(
        "lesson_id",
        String(form.lesson_id),
      );

      data.append("title", form.title.trim());

      if (form.description.trim()) {
        data.append(
          "description",
          form.description.trim(),
        );
      }

      data.append(
        "source_type",
        form.source_type,
      );

      if (
        form.source_type === "external" &&
        form.external_url.trim()
      ) {
        data.append(
          "external_url",
          form.external_url.trim(),
        );
      }

      if (form.entry_url.trim()) {
        data.append(
          "entry_url",
          form.entry_url.trim(),
        );
      }

      data.append(
        "version",
        form.version.trim() || "1.0",
      );

      data.append(
        "display_order",
        String(form.display_order),
      );

      data.append(
        "is_published",
        form.is_published ? "1" : "0",
      );

      data.append(
        "is_active",
        form.is_active ? "1" : "0",
      );

      if (selectedFile) {
        data.append("file", selectedFile);
      }

      /*
       * Laravel/PHP handles multipart POST more reliably
       * than multipart PUT. For edits we POST and spoof PUT.
       */
      if (editing) {
        data.append("_method", "PUT");
      }

      const response = await fetch(url, {
        method: "POST",

        headers: authHeaders(),

        body: data,
      });

      const payload = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const validationErrors = payload?.errors
          ? Object.values(payload.errors)
              .flat()
              .join(" ")
          : "";

        throw new Error(
          validationErrors ||
            payload?.message ||
            `Unable to ${
              editing ? "update" : "create"
            } interactive app.`,
        );
      }

      toast.success(
        editing
          ? "Interactive app updated successfully."
          : "Interactive app created successfully.",
      );

      setShowForm(false);
      setEditingApp(null);
      setSelectedFile(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save interactive app.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteApp(app: InteractiveApp) {
    const confirmed = window.confirm(
      `Delete "${app.title}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(app.id);

      const response = await fetch(
        `${API_BASE_URL}/interactive-apps/${app.id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );

      const payload = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            `Unable to delete ${app.title}.`,
        );
      }

      toast.success(`${app.title} deleted.`);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to delete interactive app.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Interactive Apps"
      description="Create and manage interactive learning apps stored in Laravel + MySQL."
    >
      <div className="space-y-4">

        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {apps.length} interactive app
            {apps.length === 1 ? "" : "s"} found
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => void loadData()}
              disabled={loading}
            >
              <RefreshCw
                className={`size-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>

            <Button
              className="rounded-2xl"
              onClick={openCreateForm}
              disabled={
                grades.length === 0 ||
                lessons.length === 0
              }
            >
              <Plus className="size-4" />
              New app
            </Button>
          </div>
        </div>

        {/* FORM */}

        {showForm ? (
          <form
            onSubmit={saveApp}
            className="space-y-5 rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {editingApp
                    ? "Edit interactive app"
                    : "New interactive app"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  Grade → Subject → Unit → Chapter → Lesson → App
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-2xl"
                onClick={closeForm}
                disabled={saving}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* CURRICULUM */}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Grade
                </span>

                <select
                  value={form.grade_id}
                  onChange={(event) =>
                    changeGrade(
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                >
                  <option value={0}>
                    Select grade
                  </option>

                  {grades.map((grade) => (
                    <option
                      key={grade.id}
                      value={grade.id}
                    >
                      {grade.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Subject
                </span>

                <select
                  value={form.subject_id}
                  onChange={(event) =>
                    changeSubject(
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                >
                  <option value={0}>
                    Select subject
                  </option>

                  {filteredSubjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Unit
                </span>

                <select
                  value={form.unit_id}
                  onChange={(event) =>
                    changeUnit(
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                >
                  <option value={0}>
                    Select unit
                  </option>

                  {filteredUnits.map((unit) => (
                    <option
                      key={unit.id}
                      value={unit.id}
                    >
                      {unit.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Chapter
                </span>

                <select
                  value={form.chapter_id}
                  onChange={(event) =>
                    changeChapter(
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                >
                  <option value={0}>
                    Select chapter
                  </option>

                  {filteredChapters.map((chapter) => (
                    <option
                      key={chapter.id}
                      value={chapter.id}
                    >
                      {chapter.chapter_number}.{" "}
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Lesson
                </span>

                <select
                  value={form.lesson_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      lesson_id: Number(
                        event.target.value,
                      ),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                >
                  <option value={0}>
                    Select lesson
                  </option>

                  {filteredLessons.map((lesson) => (
                    <option
                      key={lesson.id}
                      value={lesson.id}
                    >
                      {lesson.lesson_number}.{" "}
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* TITLE */}

            <label className="block space-y-2">
              <span className="text-sm font-medium">
                App title
              </span>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Fraction Explorer"
                className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                required
              />
            </label>

            {/* DESCRIPTION */}

            <label className="block space-y-2">
              <span className="text-sm font-medium">
                Description
              </span>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Describe what students can explore in this interactive app..."
                className="w-full rounded-xl border bg-background px-3 py-3 text-sm"
              />
            </label>

            {/* SOURCE TYPE */}

            <div className="space-y-2">
              <span className="text-sm font-medium">
                App source
              </span>

              <div className="grid gap-3 md:grid-cols-3">
                {(
                  [
                    ["external", "External URL"],
                    ["html", "HTML file"],
                    ["zip", "ZIP app"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                  >
                    <input
                      type="radio"
                      name="source_type"
                      value={value}
                      checked={
                        form.source_type === value
                      }
                      onChange={() =>
                        changeSourceType(value)
                      }
                    />

                    <span className="text-sm font-medium">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* EXTERNAL URL */}

            {form.source_type === "external" ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium">
                  External URL
                </span>

                <input
                  type="url"
                  value={form.external_url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      external_url:
                        event.target.value,
                    }))
                  }
                  placeholder="https://example.com/interactive-app"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                />
              </label>
            ) : (
              <div className="space-y-2 rounded-xl border border-dashed p-4">
                <div className="flex items-center gap-2">
                  {form.source_type === "html" ? (
                    <FileCode2 className="size-5" />
                  ) : (
                    <Upload className="size-5" />
                  )}

                  <span className="text-sm font-medium">
                    Upload{" "}
                    {form.source_type.toUpperCase()}
                  </span>
                </div>

                <input
                  type="file"
                  accept={
                    form.source_type === "html"
                      ? ".html,.htm"
                      : ".zip"
                  }
                  onChange={(event) =>
                    setSelectedFile(
                      event.target.files?.[0] ??
                        null,
                    )
                  }
                  className="block w-full text-sm"
                />

                {selectedFile ? (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                ) : editingApp?.file_path ? (
                  <p className="text-xs text-muted-foreground">
                    Current file:{" "}
                    {editingApp.file_path}
                  </p>
                ) : null}
              </div>
            )}

            {/* ENTRY URL / VERSION / ORDER */}

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Entry URL
                </span>

                <input
                  type="text"
                  value={form.entry_url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      entry_url:
                        event.target.value,
                    }))
                  }
                  placeholder="index.html"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Version
                </span>

                <input
                  type="text"
                  value={form.version}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      version: event.target.value,
                    }))
                  }
                  placeholder="1.0"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Display order
                </span>

                <input
                  type="number"
                  min={1}
                  value={form.display_order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      display_order: Number(
                        event.target.value,
                      ),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>
            </div>

            {/* STATUS */}

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border p-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      is_active:
                        event.target.checked,
                    }))
                  }
                  className="size-4"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Active
                  </span>

                  <span className="block text-xs text-muted-foreground">
                    Allow this app to be used by the platform.
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border p-3">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      is_published:
                        event.target.checked,
                    }))
                  }
                  className="size-4"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Published
                  </span>

                  <span className="block text-xs text-muted-foreground">
                    Make this app available to students.
                  </span>
                </span>
              </label>
            </div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-2xl"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}

                {saving
                  ? "Saving..."
                  : editingApp
                    ? "Save changes"
                    : "Create app"}
              </Button>
            </div>
          </form>
        ) : null}

        {/* DATA */}

        {loading ? (
          <div className="rounded-2xl border p-8 text-center">
            <Loader2 className="mx-auto mb-3 size-5 animate-spin" />
            Loading interactive apps...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 p-8 text-center">
            <p className="text-destructive">
              {error}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-background">
            <table className="w-full">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    App
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Lesson
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Type
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Version
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {apps.map((app) => {
                  const lesson =
                    lessons.find(
                      (item) =>
                        item.id === app.lesson_id,
                    ) ?? app.lesson;

                  return (
                    <tr
                      key={app.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {app.title}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Order {app.display_order}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {lesson
                          ? `${lesson.lesson_number}. ${lesson.title}`
                          : "—"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase">
                          {app.source_type}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {app.version}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={
                              app.is_active
                                ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                                : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                            }
                          >
                            {app.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                          <span
                            className={
                              app.is_published
                                ? "rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
                                : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                            }
                          >
                            {app.is_published
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                         {(app.entry_url || app.external_url) ? (
  <Button
    variant="ghost"
    size="sm"
    className="rounded-xl"
    asChild
  >
    <a
      href={app.entry_url || app.external_url || "#"}
      target="_blank"
      rel="noreferrer"
    >
      <ExternalLink className="size-4" />
      Open
    </a>
  </Button>
) : null}

                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() =>
                              openEditForm(app)
                            }
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-destructive hover:text-destructive"
                            disabled={
                              deletingId === app.id
                            }
                            onClick={() =>
                              void deleteApp(app)
                            }
                          >
                            {deletingId === app.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}

                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {apps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No interactive apps found. Click
                      "New app" to create your first app.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalPage>
  );
}
