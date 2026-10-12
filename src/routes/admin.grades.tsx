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

interface Board {
  id: number;
  name: string;
  code?: string | null;
}

interface AdminGrade {
  id: number;
  board_id: number;
  name: string;
  code: string | null;
  grade_number: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  board?: Board;
}

interface GradeForm {
  board_id: number;
  name: string;
  code: string;
  grade_number: number;
  is_active: boolean;
}

const emptyForm: GradeForm = {
  board_id: 1,
  name: "",
  code: "",
  grade_number: 6,
  is_active: true,
};

export const Route = createFileRoute("/admin/grades")({
  head: () => ({
    meta: [
      { title: "Grades — YourTeacher Admin" },
      {
        name: "description",
        content: "Manage grades stored in the YourTeacher Laravel backend.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminGradesPage,
});

function AdminGradesPage() {
  const [grades, setGrades] = useState<AdminGrade[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<AdminGrade | null>(null);
  const [form, setForm] = useState<GradeForm>(emptyForm);

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

      const [gradesResponse, boardsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/grades`, {
          headers: authHeaders(),
        }),
        fetch(`${API_BASE_URL}/boards`, {
          headers: authHeaders(),
        }),
      ]);

      if (gradesResponse.status === 401 || gradesResponse.status === 403) {
        throw new Error("Your admin session is not authorised.");
      }

      if (!gradesResponse.ok) {
        throw new Error(`Unable to load grades (${gradesResponse.status}).`);
      }

      if (!boardsResponse.ok) {
        throw new Error(`Unable to load boards (${boardsResponse.status}).`);
      }

      const gradesData = await gradesResponse.json();
      const boardsData = await boardsResponse.json();

      const nextGrades = Array.isArray(gradesData)
        ? gradesData
        : gradesData.data ?? [];

      const nextBoards = Array.isArray(boardsData)
        ? boardsData
        : boardsData.data ?? [];

      setGrades(nextGrades);
      setBoards(nextBoards);

      if (nextBoards.length > 0) {
        setForm((current) => ({
          ...current,
          board_id: current.board_id || nextBoards[0].id,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load grades from Laravel.",
      );
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openCreateForm() {
    setEditingGrade(null);

    setForm({
      ...emptyForm,
      board_id: boards[0]?.id ?? 1,
    });

    setShowForm(true);
  }

  function openEditForm(grade: AdminGrade) {
    setEditingGrade(grade);

    setForm({
      board_id: grade.board_id,
      name: grade.name,
      code: grade.code ?? "",
      grade_number: grade.grade_number,
      is_active: grade.is_active,
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingGrade(null);
    setForm(emptyForm);
  }

  async function saveGrade(event: React.FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Grade name is required.");
      return;
    }

    if (form.grade_number < 1 || form.grade_number > 12) {
      toast.error("Grade number must be between 1 and 12.");
      return;
    }

    try {
      setSaving(true);

      const editing = Boolean(editingGrade);

      const url = editing
        ? `${API_BASE_URL}/grades/${editingGrade!.id}`
        : `${API_BASE_URL}/grades`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          board_id: Number(form.board_id),
          name: form.name.trim(),
          code: form.code.trim() || null,
          grade_number: Number(form.grade_number),
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
            `Unable to ${editing ? "update" : "create"} grade.`,
        );
      }

      toast.success(
        editing
          ? "Grade updated successfully."
          : "Grade created successfully.",
      );

      closeForm();
      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error ? err.message : "Unable to save grade.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteGrade(grade: AdminGrade) {
    const confirmed = window.confirm(
      `Delete "${grade.name}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(grade.id);

      const response = await fetch(
        `${API_BASE_URL}/grades/${grade.id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.message || `Unable to delete ${grade.name}.`,
        );
      }

      toast.success(`${grade.name} deleted.`);

      await loadData();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error ? err.message : "Unable to delete grade.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Grades"
      description="Create and manage grades stored in Laravel + MySQL."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {grades.length} grade{grades.length === 1 ? "" : "s"} found
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => void loadData()}
              disabled={loading}
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              className="rounded-2xl"
              onClick={openCreateForm}
            >
              <Plus className="size-4" />
              New grade
            </Button>
          </div>
        </div>

        {showForm ? (
          <form
            onSubmit={saveGrade}
            className="space-y-4 rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {editingGrade ? "Edit grade" : "New grade"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {editingGrade
                    ? `Editing ${editingGrade.name}`
                    : "Create a new grade in the Laravel database."}
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
                <span className="text-sm font-medium">Board</span>

                <select
                  value={form.board_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      board_id: Number(event.target.value),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                >
                  {boards.length === 0 ? (
                    <option value={1}>Board 1</option>
                  ) : (
                    boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                        {board.code ? ` (${board.code})` : ""}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Grade number
                </span>

                <input
                  type="number"
                  min={1}
                  max={12}
                  value={form.grade_number}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      grade_number: Number(event.target.value),
                    }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Grade name</span>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Class 7"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Code</span>

                <input
                  type="text"
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="CLASS-7"
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
                  Active grade
                </span>

                <span className="block text-xs text-muted-foreground">
                  Active grades can be exposed to the learning platform.
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
                  : editingGrade
                    ? "Save changes"
                    : "Create grade"}
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border p-8 text-center">
            <Loader2 className="mx-auto mb-3 size-5 animate-spin" />
            Loading grades...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 p-8 text-center">
            <p className="text-destructive">{error}</p>

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
                    Grade
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Code
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Board
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
                {grades.map((grade) => (
                  <tr
                    key={grade.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {grade.name}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        ID: {grade.id}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {grade.code || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {grade.board?.name ?? `Board ${grade.board_id}`}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {grade.grade_number}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          grade.is_active
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                        }
                      >
                        {grade.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openEditForm(grade)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-destructive hover:text-destructive"
                          disabled={deletingId === grade.id}
                          onClick={() => void deleteGrade(grade)}
                        >
                          {deletingId === grade.id ? (
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

                {grades.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No grades found. Click "New grade" to create one.
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
