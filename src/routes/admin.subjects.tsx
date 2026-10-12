import { useCallback, useEffect, useState } from "react";
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
  code?: string | null;
  grade_number?: number;
}

interface AdminSubject {
  id: number;
  grade_id: number;
  name: string;
  code: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  grade?: Grade;
}

interface SubjectForm {
  grade_id: number;
  name: string;
  code: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm: SubjectForm = {
  grade_id: 0,
  name: "",
  code: "",
  icon: "",
  color: "",
  display_order: 0,
  is_active: true,
};

export const Route = createFileRoute("/admin/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — YourTeacher Admin" },
      {
        name: "description",
        content: "Manage subjects across every grade.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSubjectsPage,
});

function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] =
    useState<AdminSubject | null>(null);

  const [form, setForm] = useState<SubjectForm>(emptyForm);

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

      const [subjectsResponse, gradesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/subjects`, {
          headers: authHeaders(),
        }),

        fetch(`${API_BASE_URL}/grades`, {
          headers: authHeaders(),
        }),
      ]);

      if (
        subjectsResponse.status === 401 ||
        subjectsResponse.status === 403
      ) {
        throw new Error("Your admin session is not authorised.");
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

      const subjectsData = await subjectsResponse.json();
      const gradesData = await gradesResponse.json();

      const nextSubjects = Array.isArray(subjectsData)
        ? subjectsData
        : subjectsData.data ?? [];

      const nextGrades = Array.isArray(gradesData)
        ? gradesData
        : gradesData.data ?? [];

      setSubjects(nextSubjects);
      setGrades(nextGrades);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subjects.",
      );
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openCreateForm() {
    setEditingSubject(null);

    setForm({
      ...emptyForm,
      grade_id: grades[0]?.id ?? 0,
      display_order: subjects.length + 1,
    });

    setShowForm(true);
  }

  function openEditForm(subject: AdminSubject) {
    setEditingSubject(subject);

    setForm({
      grade_id: subject.grade_id,
      name: subject.name,
      code: subject.code ?? "",
      icon: subject.icon ?? "",
      color: subject.color ?? "",
      display_order: subject.display_order ?? 0,
      is_active: subject.is_active,
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingSubject(null);
    setForm(emptyForm);
  }

  async function saveSubject(event: React.FormEvent) {
    event.preventDefault();

    if (!form.grade_id) {
      toast.error("Please select a grade.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Subject name is required.");
      return;
    }

    try {
      setSaving(true);

      const editing = Boolean(editingSubject);

      const url = editing
        ? `${API_BASE_URL}/subjects/${editingSubject!.id}`
        : `${API_BASE_URL}/subjects`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",

        headers: authHeaders(),

        body: JSON.stringify({
          grade_id: Number(form.grade_id),
          name: form.name.trim(),
          code: form.code.trim() || null,
          icon: form.icon.trim() || null,
          color: form.color.trim() || null,
          display_order: Number(form.display_order),
          is_active: form.is_active,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationErrors = payload?.errors
          ? Object.values(payload.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
            payload?.message ||
            `Unable to ${editing ? "update" : "create"} subject.`,
        );
      }

      toast.success(
        editing
          ? "Subject updated successfully."
          : "Subject created successfully.",
      );

      setShowForm(false);
      setEditingSubject(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save subject.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubject(subject: AdminSubject) {
    const confirmed = window.confirm(
      `Delete "${subject.name}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(subject.id);

      const response = await fetch(
        `${API_BASE_URL}/subjects/${subject.id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            `Unable to delete ${subject.name}.`,
        );
      }

      toast.success(`${subject.name} deleted.`);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to delete subject.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Subjects"
      description="Create and manage subjects stored in Laravel + MySQL."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {subjects.length} subject
            {subjects.length === 1 ? "" : "s"} found
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
              disabled={grades.length === 0}
            >
              <Plus className="size-4" />
              New subject
            </Button>
          </div>
        </div>

        {grades.length === 0 && !loading ? (
          <div className="rounded-2xl border border-warning/30 p-4 text-sm">
            You need at least one grade before creating subjects.
          </div>
        ) : null}

        {showForm ? (
          <form
            onSubmit={saveSubject}
            className="space-y-4 rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {editingSubject
                    ? "Edit subject"
                    : "New subject"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {editingSubject
                    ? `Editing ${editingSubject.name}`
                    : "Create a subject and assign it to a grade."}
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
                    setForm((current) => ({
                      ...current,
                      grade_id: Number(event.target.value),
                    }))
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
                  Subject name
                </span>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Mathematics"
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
                  placeholder="MATH"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Display order
                </span>

                <input
                  type="number"
                  min={0}
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

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Icon
                </span>

                <input
                  type="text"
                  value={form.icon}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      icon: event.target.value,
                    }))
                  }
                  placeholder="calculator"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Color
                </span>

                <input
                  type="text"
                  value={form.color}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  placeholder="#2563EB"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                />
              </label>
            </div>

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
                  Active subject
                </span>

                <span className="block text-xs text-muted-foreground">
                  Active subjects can be shown to students.
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
                  : editingSubject
                    ? "Save changes"
                    : "Create subject"}
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border p-8 text-center">
            <Loader2 className="mx-auto mb-3 size-5 animate-spin" />
            Loading subjects...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 p-8 text-center">
            <p className="text-destructive">
              {error}
            </p>

            <Button
              variant="outline"
              className="mt-4 rounded-2xl"
              onClick={() => void loadData()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-background">
            <table className="w-full">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Subject
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Code
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Grade
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Order
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
                {subjects.map((subject) => (
                  <tr
                    key={subject.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {subject.name}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        ID: {subject.id}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {subject.code || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {subject.grade?.name ??
                        `Grade ${subject.grade_id}`}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {subject.display_order}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          subject.is_active
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                        }
                      >
                        {subject.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() =>
                            openEditForm(subject)
                          }
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-destructive hover:text-destructive"
                          disabled={
                            deletingId === subject.id
                          }
                          onClick={() =>
                            void deleteSubject(subject)
                          }
                        >
                          {deletingId === subject.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}

                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {subjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No subjects found. Click "New subject" to create one.
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
