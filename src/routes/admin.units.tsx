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

interface AdminUnit {
  id: number;
  subject_id: number;
  title: string;
  code: string | null;
  unit_number: number;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
  subject?: Subject;
}

interface UnitForm {
  grade_id: number;
  subject_id: number;
  title: string;
  code: string;
  unit_number: number;
  description: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm: UnitForm = {
  grade_id: 0,
  subject_id: 0,
  title: "",
  code: "",
  unit_number: 1,
  description: "",
  display_order: 1,
  is_active: true,
};

export const Route = createFileRoute("/admin/units")({
  head: () => ({
    meta: [
      { title: "Units — YourSchool Admin" },
      {
        name: "description",
        content: "Manage curriculum units.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUnitsPage,
});

function AdminUnitsPage() {
  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<AdminUnit | null>(null);
  const [form, setForm] = useState<UnitForm>(emptyForm);

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

      const [unitsResponse, subjectsResponse, gradesResponse] =
        await Promise.all([
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
        unitsResponse.status === 401 ||
        unitsResponse.status === 403
      ) {
        throw new Error("Your admin session is not authorised.");
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

      const unitsData = await unitsResponse.json();
      const subjectsData = await subjectsResponse.json();
      const gradesData = await gradesResponse.json();

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
          : "Unable to load units.",
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

  function openCreateForm() {
    const firstGrade = grades[0];

    const firstSubject = firstGrade
      ? subjects.find(
          (subject) => subject.grade_id === firstGrade.id,
        )
      : undefined;

    setEditingUnit(null);

    setForm({
      ...emptyForm,
      grade_id: firstGrade?.id ?? 0,
      subject_id: firstSubject?.id ?? 0,
      unit_number: units.length + 1,
      display_order: units.length + 1,
    });

    setShowForm(true);
  }

  function openEditForm(unit: AdminUnit) {
    const subject = subjects.find(
      (item) => item.id === unit.subject_id,
    );

    setEditingUnit(unit);

    setForm({
      grade_id:
        subject?.grade_id ??
        unit.subject?.grade_id ??
        0,

      subject_id: unit.subject_id,

      title: unit.title,

      code: unit.code ?? "",

      unit_number: unit.unit_number,

      description: unit.description ?? "",

      display_order:
        unit.display_order ?? unit.unit_number,

      is_active: unit.is_active,
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingUnit(null);
    setForm(emptyForm);
  }

  function changeGrade(gradeId: number) {
    const firstSubject = subjects.find(
      (subject) => subject.grade_id === gradeId,
    );

    setForm((current) => ({
      ...current,
      grade_id: gradeId,
      subject_id: firstSubject?.id ?? 0,
    }));
  }

  async function saveUnit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.grade_id) {
      toast.error("Please select a grade.");
      return;
    }

    if (!form.subject_id) {
      toast.error("Please select a subject.");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Unit title is required.");
      return;
    }

    try {
      setSaving(true);

      const editing = Boolean(editingUnit);

      const url = editing
        ? `${API_BASE_URL}/units/${editingUnit!.id}`
        : `${API_BASE_URL}/units`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",

        headers: authHeaders(),

        body: JSON.stringify({
          subject_id: Number(form.subject_id),
          title: form.title.trim(),
          code: form.code.trim() || null,
          unit_number: Number(form.unit_number),
          description:
            form.description.trim() || null,
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
            } unit.`,
        );
      }

      toast.success(
        editing
          ? "Unit updated successfully."
          : "Unit created successfully.",
      );

      setShowForm(false);
      setEditingUnit(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save unit.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteUnit(unit: AdminUnit) {
    const confirmed = window.confirm(
      `Delete "${unit.title}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(unit.id);

      const response = await fetch(
        `${API_BASE_URL}/units/${unit.id}`,
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
            `Unable to delete ${unit.title}.`,
        );
      }

      toast.success(`${unit.title} deleted.`);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to delete unit.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Units"
      description="Create and manage curriculum units stored in Laravel + MySQL."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {units.length} unit
            {units.length === 1 ? "" : "s"} found
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
                subjects.length === 0
              }
            >
              <Plus className="size-4" />
              New unit
            </Button>
          </div>
        </div>

        {showForm ? (
          <form
            onSubmit={saveUnit}
            className="space-y-4 rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {editingUnit
                    ? "Edit unit"
                    : "New unit"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  Grade → Subject → Unit
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

            <div className="grid gap-4 md:grid-cols-2">
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
                    setForm((current) => ({
                      ...current,
                      subject_id: Number(
                        event.target.value,
                      ),
                    }))
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
                  Unit title
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
                  placeholder="Numbers and Operations"
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
                  placeholder="MATH-U1"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Unit number
                </span>

                <input
                  type="number"
                  min={1}
                  value={form.unit_number}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      unit_number: Number(
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
                placeholder="Short description of this unit..."
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
                  Active unit
                </span>

                <span className="block text-xs text-muted-foreground">
                  Active units can be shown to students.
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
                  : editingUnit
                    ? "Save changes"
                    : "Create unit"}
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border p-8 text-center">
            <Loader2 className="mx-auto mb-3 size-5 animate-spin" />
            Loading units...
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
                {units.map((unit) => {
                  const subject =
                    subjects.find(
                      (item) =>
                        item.id === unit.subject_id,
                    ) ?? unit.subject;

                  const grade = grades.find(
                    (item) =>
                      item.id === subject?.grade_id,
                  );

                  return (
                    <tr
                      key={unit.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {unit.title}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {unit.code || `ID: ${unit.id}`}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {subject?.name ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {grade?.name ??
                          subject?.grade?.name ??
                          "—"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {unit.unit_number}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            unit.is_active
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                          }
                        >
                          {unit.is_active
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
                              openEditForm(unit)
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
                              deletingId === unit.id
                            }
                            onClick={() =>
                              void deleteUnit(unit)
                            }
                          >
                            {deletingId === unit.id ? (
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

                {units.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No units found. Click "New unit" to create one.
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
