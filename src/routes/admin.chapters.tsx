import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
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

interface AdminChapter {
  id: number;
  unit_id: number;
  title: string;
  code: string | null;
  chapter_number: number;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
  unit?: Unit;
}

interface ChapterForm {
  grade_id: number;
  subject_id: number;
  unit_id: number;
  title: string;
  code: string;
  chapter_number: number;
  description: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm: ChapterForm = {
  grade_id: 0,
  subject_id: 0,
  unit_id: 0,
  title: "",
  code: "",
  chapter_number: 1,
  description: "",
  display_order: 1,
  is_active: true,
};

export const Route = createFileRoute("/admin/chapters")({
  head: () => ({
    meta: [
      { title: "Chapters — YourSchool Admin" },
      {
        name: "description",
        content: "Create and manage curriculum chapters.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminChaptersPage,
});

function AdminChaptersPage() {
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] =
    useState<AdminChapter | null>(null);

  const [form, setForm] = useState<ChapterForm>(emptyForm);

  const authHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        chaptersResponse,
        unitsResponse,
        subjectsResponse,
        gradesResponse,
      ] = await Promise.all([
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
        chaptersResponse.status === 401 ||
        chaptersResponse.status === 403
      ) {
        throw new Error("Your admin session is not authorised.");
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

      const chaptersData = await chaptersResponse.json();
      const unitsData = await unitsResponse.json();
      const subjectsData = await subjectsResponse.json();
      const gradesData = await gradesResponse.json();

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
          : "Unable to load chapters.",
      );
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

    setEditingChapter(null);

    setForm({
      ...emptyForm,
      grade_id: firstGrade?.id ?? 0,
      subject_id: firstSubject?.id ?? 0,
      unit_id: firstUnit?.id ?? 0,
      chapter_number: chapters.length + 1,
      display_order: chapters.length + 1,
    });

    setShowForm(true);
  }

  function openEditForm(chapter: AdminChapter) {
    const unit =
      units.find((item) => item.id === chapter.unit_id) ??
      chapter.unit;

    const subject = unit
      ? subjects.find(
          (item) => item.id === unit.subject_id,
        ) ?? unit.subject
      : undefined;

    setEditingChapter(chapter);

    setForm({
      grade_id:
        subject?.grade_id ??
        subject?.grade?.id ??
        0,

      subject_id:
        unit?.subject_id ??
        subject?.id ??
        0,

      unit_id: chapter.unit_id,

      title: chapter.title,

      code: chapter.code ?? "",

      chapter_number: chapter.chapter_number,

      description: chapter.description ?? "",

      display_order:
        chapter.display_order ?? chapter.chapter_number,

      is_active: chapter.is_active,
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingChapter(null);
    setForm(emptyForm);
  }

  function changeGrade(gradeId: number) {
    const firstSubject = subjects.find(
      (subject) => subject.grade_id === gradeId,
    );

    const firstUnit = firstSubject
      ? units.find(
          (unit) => unit.subject_id === firstSubject.id,
        )
      : undefined;

    setForm((current) => ({
      ...current,
      grade_id: gradeId,
      subject_id: firstSubject?.id ?? 0,
      unit_id: firstUnit?.id ?? 0,
    }));
  }

  function changeSubject(subjectId: number) {
    const firstUnit = units.find(
      (unit) => unit.subject_id === subjectId,
    );

    setForm((current) => ({
      ...current,
      subject_id: subjectId,
      unit_id: firstUnit?.id ?? 0,
    }));
  }

  async function saveChapter(event: React.FormEvent) {
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

    if (!form.title.trim()) {
      toast.error("Chapter title is required.");
      return;
    }

    if (form.chapter_number < 1) {
      toast.error("Chapter number must be at least 1.");
      return;
    }

    try {
      setSaving(true);

      const editing = Boolean(editingChapter);

      const url = editing
        ? `${API_BASE_URL}/chapters/${editingChapter!.id}`
        : `${API_BASE_URL}/chapters`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",

        headers: authHeaders(),

        body: JSON.stringify({
          unit_id: Number(form.unit_id),
          title: form.title.trim(),
          code: form.code.trim() || null,
          chapter_number: Number(form.chapter_number),
          description: form.description.trim() || null,
          display_order: Number(form.display_order),
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
            } chapter.`,
        );
      }

      toast.success(
        editing
          ? "Chapter updated successfully."
          : "Chapter created successfully.",
      );

      setShowForm(false);
      setEditingChapter(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save chapter.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteChapter(chapter: AdminChapter) {
    const confirmed = window.confirm(
      `Delete "${chapter.title}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(chapter.id);

      const response = await fetch(
        `${API_BASE_URL}/chapters/${chapter.id}`,
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
            `Unable to delete ${chapter.title}.`,
        );
      }

      toast.success(`${chapter.title} deleted.`);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to delete chapter.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Chapters"
      description="Create and manage curriculum chapters stored in Laravel + MySQL."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {chapters.length} chapter
            {chapters.length === 1 ? "" : "s"} found
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
                subjects.length === 0 ||
                units.length === 0
              }
            >
              <Plus className="size-4" />
              New chapter
            </Button>
          </div>
        </div>

        {showForm ? (
          <form
            onSubmit={saveChapter}
            className="space-y-4 rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {editingChapter
                    ? "Edit chapter"
                    : "New chapter"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  Grade → Subject → Unit → Chapter
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

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Grade
                </span>

                <select
                  value={form.grade_id}
                  onChange={(event) =>
                    changeGrade(Number(event.target.value))
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
                  required
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
                    setForm((current) => ({
                      ...current,
                      unit_id: Number(
                        event.target.value,
                      ),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Chapter title
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
                  placeholder="Integers"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Code
                </span>

                <input
                  type="text"
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="MATH-U1-C1"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Chapter number
                </span>

                <input
                  type="number"
                  min={1}
                  value={form.chapter_number}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      chapter_number: Number(
                        event.target.value,
                      ),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
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
                placeholder="Short description of this chapter..."
                rows={4}
                className="w-full rounded-xl border bg-background px-3 py-3 text-sm"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border p-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
                className="size-4"
              />

              <span>
                <span className="block text-sm font-medium">
                  Active chapter
                </span>

                <span className="block text-xs text-muted-foreground">
                  Active chapters can be shown to students.
                </span>
              </span>
            </label>

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
                  : editingChapter
                    ? "Save changes"
                    : "Create chapter"}
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border p-8 text-center">
            <Loader2 className="mx-auto mb-3 size-5 animate-spin" />
            Loading chapters...
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
                    Number
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
                {chapters.map((chapter) => {
                  const unit =
                    units.find(
                      (item) =>
                        item.id === chapter.unit_id,
                    ) ?? chapter.unit;

                  const subject = unit
                    ? subjects.find(
                        (item) =>
                          item.id === unit.subject_id,
                      ) ?? unit.subject
                    : undefined;

                  const grade = subject
                    ? grades.find(
                        (item) =>
                          item.id === subject.grade_id,
                      ) ?? subject.grade
                    : undefined;

                  return (
                    <tr
                      key={chapter.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {chapter.title}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {chapter.code ||
                            `ID: ${chapter.id}`}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {unit?.title ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {subject?.name ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {grade?.name ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {chapter.chapter_number}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            chapter.is_active
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                          }
                        >
                          {chapter.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() =>
                              openEditForm(chapter)
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
                              deletingId === chapter.id
                            }
                            onClick={() =>
                              void deleteChapter(chapter)
                            }
                          >
                            {deletingId === chapter.id ? (
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

                {chapters.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No chapters found. Click "New chapter" to create one.
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
