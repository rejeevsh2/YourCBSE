import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
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
  code?: string | null;
  grade?: Grade;
}

interface Unit {
  id: number;
  subject_id: number;
  title: string;
  code?: string | null;
  unit_number: number;
  subject?: Subject;
}

interface Chapter {
  id: number;
  unit_id: number;
  title: string;
  code?: string | null;
  chapter_number: number;
  unit?: Unit;
}

interface AdminLesson {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
  lesson_number: number;
  summary: string | null;
  duration: number | null;
  display_order: number | null;
  is_published: boolean;
  is_active: boolean;
  chapter?: Chapter;
}

interface LessonForm {
  grade_id: number;
  subject_id: number;
  unit_id: number;
  chapter_id: number;

  title: string;
  slug: string;

  lesson_number: number;
  summary: string;
  duration: number;
  display_order: number;

  is_published: boolean;
  is_active: boolean;
}

const emptyForm: LessonForm = {
  grade_id: 0,
  subject_id: 0,
  unit_id: 0,
  chapter_id: 0,

  title: "",
  slug: "",

  lesson_number: 1,
  summary: "",
  duration: 10,
  display_order: 1,

  is_published: false,
  is_active: true,
};

/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute("/admin/lessons")({
  head: () => ({
    meta: [
      { title: "Lessons — YourTeacher Admin" },
      {
        name: "description",
        content: "Create and manage curriculum lessons.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),

  component: AdminLessonsPage,
});

/* =========================================================
   HELPERS
========================================================= */

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================================
   PAGE
========================================================= */

function AdminLessonsPage() {
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingLesson, setEditingLesson] =
    useState<AdminLesson | null>(null);

  const [form, setForm] = useState<LessonForm>(emptyForm);

  /* =======================================================
     AUTH HEADERS
  ======================================================= */

  const authHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();

    return {
      Accept: "application/json",
      "Content-Type": "application/json",

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
        lessonsResponse,
        chaptersResponse,
        unitsResponse,
        subjectsResponse,
        gradesResponse,
      ] = await Promise.all([
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
        lessonsResponse.status === 401 ||
        lessonsResponse.status === 403
      ) {
        throw new Error(
          "Your admin session is not authorised.",
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

      const lessonsData = await lessonsResponse.json();
      const chaptersData = await chaptersResponse.json();
      const unitsData = await unitsResponse.json();
      const subjectsData = await subjectsResponse.json();
      const gradesData = await gradesResponse.json();

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
          : "Unable to load lessons.",
      );
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* =======================================================
     FILTERED CURRICULUM
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

  /* =======================================================
     CREATE FORM
  ======================================================= */

  function openCreateForm() {
    const firstGrade = grades[0];

    const firstSubject = firstGrade
      ? subjects.find(
          (subject) =>
            subject.grade_id === firstGrade.id,
        )
      : undefined;

    const firstUnit = firstSubject
      ? units.find(
          (unit) =>
            unit.subject_id === firstSubject.id,
        )
      : undefined;

    const firstChapter = firstUnit
      ? chapters.find(
          (chapter) =>
            chapter.unit_id === firstUnit.id,
        )
      : undefined;

    setEditingLesson(null);

    setForm({
      ...emptyForm,

      grade_id: firstGrade?.id ?? 0,

      subject_id: firstSubject?.id ?? 0,

      unit_id: firstUnit?.id ?? 0,

      chapter_id: firstChapter?.id ?? 0,

      lesson_number: lessons.length + 1,

      display_order: lessons.length + 1,
    });

    setShowForm(true);
  }

  /* =======================================================
     EDIT FORM
  ======================================================= */

  function openEditForm(lesson: AdminLesson) {
    const chapter =
      chapters.find(
        (item) => item.id === lesson.chapter_id,
      ) ?? lesson.chapter;

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

    setEditingLesson(lesson);

    setForm({
      grade_id:
        grade?.id ??
        subject?.grade_id ??
        0,

      subject_id:
        subject?.id ??
        unit?.subject_id ??
        0,

      unit_id:
        unit?.id ??
        chapter?.unit_id ??
        0,

      chapter_id: lesson.chapter_id,

      title: lesson.title,

      slug: lesson.slug,

      lesson_number: lesson.lesson_number,

      summary: lesson.summary ?? "",

      duration: lesson.duration ?? 10,

      display_order:
        lesson.display_order ??
        lesson.lesson_number,

      is_published: lesson.is_published,

      is_active: lesson.is_active,
    });

    setShowForm(true);
  }

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingLesson(null);
    setForm(emptyForm);
  }

  /* =======================================================
     CURRICULUM CHANGES
  ======================================================= */

  function changeGrade(gradeId: number) {
    const firstSubject = subjects.find(
      (subject) => subject.grade_id === gradeId,
    );

    const firstUnit = firstSubject
      ? units.find(
          (unit) =>
            unit.subject_id === firstSubject.id,
        )
      : undefined;

    const firstChapter = firstUnit
      ? chapters.find(
          (chapter) =>
            chapter.unit_id === firstUnit.id,
        )
      : undefined;

    setForm((current) => ({
      ...current,

      grade_id: gradeId,

      subject_id: firstSubject?.id ?? 0,

      unit_id: firstUnit?.id ?? 0,

      chapter_id: firstChapter?.id ?? 0,
    }));
  }

  function changeSubject(subjectId: number) {
    const firstUnit = units.find(
      (unit) => unit.subject_id === subjectId,
    );

    const firstChapter = firstUnit
      ? chapters.find(
          (chapter) =>
            chapter.unit_id === firstUnit.id,
        )
      : undefined;

    setForm((current) => ({
      ...current,

      subject_id: subjectId,

      unit_id: firstUnit?.id ?? 0,

      chapter_id: firstChapter?.id ?? 0,
    }));
  }

  function changeUnit(unitId: number) {
    const firstChapter = chapters.find(
      (chapter) => chapter.unit_id === unitId,
    );

    setForm((current) => ({
      ...current,

      unit_id: unitId,

      chapter_id: firstChapter?.id ?? 0,
    }));
  }

  /* =======================================================
     TITLE / SLUG
  ======================================================= */

  function changeTitle(title: string) {
    setForm((current) => ({
      ...current,

      title,

      slug: editingLesson
        ? current.slug
        : createSlug(title),
    }));
  }

  /* =======================================================
     SAVE LESSON
  ======================================================= */

  async function saveLesson(event: React.FormEvent) {
    event.preventDefault();

    if (!form.grade_id) {
      toast.error("Please select a grade.");
      return;
    }

    if (!form.subject_id) {
      toast.error("Please select a subject.");
      return;
    }

    if (!form.unit_id) {
      toast.error("Please select a unit.");
      return;
    }

    if (!form.chapter_id) {
      toast.error("Please select a chapter.");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Lesson title is required.");
      return;
    }

    if (!form.slug.trim()) {
      toast.error("Lesson slug is required.");
      return;
    }

    if (form.lesson_number < 1) {
      toast.error(
        "Lesson number must be at least 1.",
      );
      return;
    }

    if (form.duration < 1) {
      toast.error(
        "Duration must be at least 1 minute.",
      );
      return;
    }

    try {
      setSaving(true);

      const editing = Boolean(editingLesson);

      const url = editing
        ? `${API_BASE_URL}/lessons/${editingLesson!.id}`
        : `${API_BASE_URL}/lessons`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",

        headers: authHeaders(),

        body: JSON.stringify({
          chapter_id: Number(form.chapter_id),

          title: form.title.trim(),

          slug: form.slug.trim(),

          lesson_number: Number(
            form.lesson_number,
          ),

          summary:
            form.summary.trim() || null,

          duration: Number(form.duration),

          display_order: Number(
            form.display_order,
          ),

          is_published: form.is_published,

          is_active: form.is_active,
        }),
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
            } lesson.`,
        );
      }

      toast.success(
        editing
          ? "Lesson updated successfully."
          : "Lesson created successfully.",
      );

      setShowForm(false);

      setEditingLesson(null);

      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save lesson.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE LESSON
  ======================================================= */

  async function deleteLesson(
    lesson: AdminLesson,
  ) {
    const confirmed = window.confirm(
      `Delete "${lesson.title}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(lesson.id);

      const response = await fetch(
        `${API_BASE_URL}/lessons/${lesson.id}`,
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
            `Unable to delete ${lesson.title}.`,
        );
      }

      toast.success(
        `${lesson.title} deleted.`,
      );

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to delete lesson.",
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
      title="Lessons"
      description="Create and manage lessons stored in Laravel + MySQL."
    >
      <div className="space-y-4">
        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {lessons.length} lesson
            {lessons.length === 1 ? "" : "s"} found
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
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </Button>

            <Button
              className="rounded-2xl"
              onClick={openCreateForm}
              disabled={
                grades.length === 0 ||
                subjects.length === 0 ||
                units.length === 0 ||
                chapters.length === 0
              }
            >
              <Plus className="size-4" />
              New lesson
            </Button>
          </div>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        {showForm ? (
          <form
            onSubmit={saveLesson}
            className="space-y-5 rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {editingLesson
                    ? "Edit lesson"
                    : "New lesson"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  Grade → Subject → Unit →
                  Chapter → Lesson
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

            {/* CURRICULUM SELECTORS */}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* GRADE */}

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Grade
                </span>

                <select
                  value={form.grade_id}
                  onChange={(event) =>
                    changeGrade(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
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

              {/* SUBJECT */}

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Subject
                </span>

                <select
                  value={form.subject_id}
                  onChange={(event) =>
                    changeSubject(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                >
                  <option value={0}>
                    Select subject
                  </option>

                  {filteredSubjects.map(
                    (subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                      </option>
                    ),
                  )}
                </select>
              </label>

              {/* UNIT */}

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Unit
                </span>

                <select
                  value={form.unit_id}
                  onChange={(event) =>
                    changeUnit(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                >
                  <option value={0}>
                    Select unit
                  </option>

                  {filteredUnits.map(
                    (unit) => (
                      <option
                        key={unit.id}
                        value={unit.id}
                      >
                        {unit.title}
                      </option>
                    ),
                  )}
                </select>
              </label>

              {/* CHAPTER */}

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Chapter
                </span>

                <select
                  value={form.chapter_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,

                      chapter_id: Number(
                        event.target.value,
                      ),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                >
                  <option value={0}>
                    Select chapter
                  </option>

                  {filteredChapters.map(
                    (chapter) => (
                      <option
                        key={chapter.id}
                        value={chapter.id}
                      >
                        Chapter{" "}
                        {
                          chapter.chapter_number
                        }
                        : {chapter.title}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            {/* TITLE + SLUG */}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Lesson title
                </span>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    changeTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Introduction to Integers"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Slug
                </span>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,

                      slug: createSlug(
                        event.target.value,
                      ),
                    }))
                  }
                  placeholder="introduction-to-integers"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                />

                <span className="block text-xs text-muted-foreground">
                  Automatically created from
                  the lesson title.
                </span>
              </label>
            </div>

            {/* NUMBERS */}

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Lesson number
                </span>

                <input
                  type="number"
                  min={1}
                  value={
                    form.lesson_number
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,

                      lesson_number:
                        Number(
                          event.target
                            .value,
                        ),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Duration (minutes)
                </span>

                <input
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,

                      duration: Number(
                        event.target.value,
                      ),
                    }))
                  }
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
                  value={
                    form.display_order
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,

                      display_order:
                        Number(
                          event.target
                            .value,
                        ),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>
            </div>

            {/* SUMMARY */}

            <label className="block space-y-2">
              <span className="text-sm font-medium">
                Summary
              </span>

              <textarea
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,

                    summary:
                      event.target.value,
                  }))
                }
                placeholder="Short description of what students will learn in this lesson..."
                rows={4}
                className="w-full rounded-xl border bg-background px-3 py-3 text-sm"
              />
            </label>

            {/* STATUS */}

            <div className="grid gap-3 md:grid-cols-2">
              {/* ACTIVE */}

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
                    Active lesson
                  </span>

                  <span className="block text-xs text-muted-foreground">
                    Lesson can be used by the
                    platform.
                  </span>
                </span>
              </label>

              {/* PUBLISHED */}

              <label className="flex items-center gap-3 rounded-xl border p-3">
                <input
                  type="checkbox"
                  checked={
                    form.is_published
                  }
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
                    Make this lesson available
                    to students.
                  </span>
                </span>
              </label>
            </div>

            {/* FORM BUTTONS */}

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
                  : editingLesson
                    ? "Save changes"
                    : "Create lesson"}
              </Button>
            </div>
          </form>
        ) : null}

        {/* =================================================
            DATA TABLE
        ================================================= */}

        {loading ? (
          <div className="rounded-2xl border p-8 text-center">
            <Loader2 className="mx-auto mb-3 size-5 animate-spin" />

            Loading lessons...
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
                    Lesson
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Chapter
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Unit
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Subject
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Grade
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Duration
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
                {lessons.map((lesson) => {
                  const chapter =
                    chapters.find(
                      (item) =>
                        item.id ===
                        lesson.chapter_id,
                    ) ??
                    lesson.chapter;

                  const unit = chapter
                    ? units.find(
                        (item) =>
                          item.id ===
                          chapter.unit_id,
                      ) ?? chapter.unit
                    : undefined;

                  const subject = unit
                    ? subjects.find(
                        (item) =>
                          item.id ===
                          unit.subject_id,
                      ) ?? unit.subject
                    : undefined;

                  const grade = subject
                    ? grades.find(
                        (item) =>
                          item.id ===
                          subject.grade_id,
                      ) ?? subject.grade
                    : undefined;

                  return (
                    <tr
                      key={lesson.id}
                      className="border-b last:border-b-0"
                    >
                      {/* LESSON */}

                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {lesson.lesson_number}.{" "}
                          {lesson.title}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {lesson.slug}
                        </div>
                      </td>

                      {/* CHAPTER */}

                      <td className="px-4 py-4 text-sm">
                        {chapter
                          ? `${chapter.chapter_number}. ${chapter.title}`
                          : "—"}
                      </td>

                      {/* UNIT */}

                      <td className="px-4 py-4 text-sm">
                        {unit?.title ?? "—"}
                      </td>

                      {/* SUBJECT */}

                      <td className="px-4 py-4 text-sm">
                        {subject?.name ?? "—"}
                      </td>

                      {/* GRADE */}

                      <td className="px-4 py-4 text-sm">
                        {grade?.name ?? "—"}
                      </td>

                      {/* DURATION */}

                      <td className="px-4 py-4 text-sm">
                        {lesson.duration
                          ? `${lesson.duration} min`
                          : "—"}
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={
                              lesson.is_active
                                ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                                : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                            }
                          >
                            {lesson.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                          <span
                            className={
                              lesson.is_published
                                ? "rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
                                : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                            }
                          >
                            {lesson.is_published
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                      </td>

               {/* ACTIONS */}

<td className="px-4 py-4">
  <div className="flex justify-end gap-2">
    <Button
      variant="outline"
      size="sm"
      className="rounded-xl"
      asChild
    >
      <Link
        to="/admin/lesson-contents"
        search={{
          lesson: lesson.id,
        }}
      >
        <FileText className="size-4" />
        Manage Content
      </Link>
    </Button>

    <Button
      variant="outline"
      size="sm"
      className="rounded-xl"
      onClick={() =>
        openEditForm(lesson)
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
        deletingId === lesson.id
      }
      onClick={() =>
        void deleteLesson(lesson)
      }
    >
      {deletingId === lesson.id ? (
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

                {lessons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No lessons found. Click
                      "New lesson" to create your
                      first lesson.
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
