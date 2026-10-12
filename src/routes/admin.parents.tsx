import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  HeartHandshake,
  Link2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Unlink,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/parents")({
  head: () => ({
    meta: [
      {
        title: "Parents — YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Manage parent and guardian accounts and link them to students.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminParentsPage,
});

type LinkedStudent = {
  link_id: number;
  id: number;
  name: string;
  email: string;
  relationship: string | null;
  is_primary: boolean;
};

type ParentAccount = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  created_at: string | null;
  students: LinkedStudent[];
};

type StudentOption = {
  id: number;
  name: string;
  email: string;
};

type ParentStats = {
  parents: number;
  linked_students: number;
  relationships: number;
  unlinked_parents: number;
};

type ParentIndexResponse = {
  parents: ParentAccount[];
  students: StudentOption[];
  stats: ParentStats;
};

type ParentMutationResponse = {
  message: string;
  parent?: {
    id: number;
    name: string;
    email: string;
    mobile: string | null;
  };
};

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function AdminParentsPage() {
  const [data, setData] =
    useState<ParentIndexResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [
    selectedParentId,
    setSelectedParentId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    editingParentId,
    setEditingParentId,
  ] =
    useState<number | null>(
      null,
    );

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    studentId,
    setStudentId,
  ] =
    useState("");

  const [
    relationship,
    setRelationship,
  ] =
    useState("");

  const [
    isPrimary,
    setIsPrimary,
  ] =
    useState(false);

  const loadParents =
    useCallback(
      async (
        preferredParentId?:
          number | null,
      ) => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await apiRequest<ParentIndexResponse>(
              "/admin/parents",
              {
                method: "GET",
              },
            );

          if (
            !result.ok ||
            !result.data
          ) {
            throw new Error(
              result.message ||
                "Could not load parent accounts.",
            );
          }

          const next =
            result.data;

          setData(next);

          setSelectedParentId(
            (previous) => {
              const preferred =
                preferredParentId ??
                previous;

              if (
                preferred &&
                next.parents.some(
                  (parent) =>
                    parent.id ===
                    preferred,
                )
              ) {
                return preferred;
              }

              return (
                next.parents[0]
                  ?.id ?? null
              );
            },
          );
        } catch (err) {
          console.error(
            "Parent management error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Could not load parent accounts.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadParents();
  }, [loadParents]);

  const filteredParents =
    useMemo(() => {
      const parents =
        data?.parents ?? [];

      const term =
        search
          .trim()
          .toLowerCase();

      if (!term) {
        return parents;
      }

      return parents.filter(
        (parent) => {
          const childText =
            parent.students
              .map(
                (student) =>
                  `${student.name} ${student.email} ${student.relationship ?? ""}`,
              )
              .join(" ")
              .toLowerCase();

          return [
            parent.name,
            parent.email,
            parent.mobile ??
              "",
            childText,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(term),
          );
        },
      );
    }, [
      data?.parents,
      search,
    ]);

  const selectedParent =
    useMemo(
      () =>
        data?.parents.find(
          (parent) =>
            parent.id ===
            selectedParentId,
        ) ?? null,
      [
        data?.parents,
        selectedParentId,
      ],
    );

  function clearParentForm() {
    setEditingParentId(null);
    setName("");
    setEmail("");
    setMobile("");
    setPassword("");
  }

  function beginEdit(
    parent: ParentAccount,
  ) {
    setEditingParentId(
      parent.id,
    );

    setName(
      parent.name,
    );

    setEmail(
      parent.email,
    );

    setMobile(
      parent.mobile ?? "",
    );

    setPassword("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveParent(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setBusy(true);
    setError(null);

    try {
      const editing =
        editingParentId !== null;

      const body: {
        name: string;
        email: string;
        mobile: string | null;
        password?: string;
      } = {
        name:
          name.trim(),
        email:
          email.trim(),
        mobile:
          mobile.trim() ||
          null,
      };

      if (
        !editing ||
        password
      ) {
        body.password =
          password;
      }

      const result =
        await apiRequest<ParentMutationResponse>(
          editing
            ? `/admin/parents/${editingParentId}`
            : "/admin/parents",
          {
            method:
              editing
                ? "PUT"
                : "POST",
            body,
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not save parent account.",
        );
      }

      const parentId =
        result.data?.parent
          ?.id ??
        editingParentId;

      toast.success(
        editing
          ? "Parent account updated."
          : "Parent account created.",
      );

      clearParentForm();

      await loadParents(
        parentId,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not save parent account.";

      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteParent(
    parent: ParentAccount,
  ) {
    const confirmed =
      window.confirm(
        `Delete parent account "${parent.name}"?\n\nThis will also remove all student links for this parent.`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);

    try {
      const result =
        await apiRequest<{
          message: string;
        }>(
          `/admin/parents/${parent.id}`,
          {
            method:
              "DELETE",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete parent account.",
        );
      }

      if (
        editingParentId ===
        parent.id
      ) {
        clearParentForm();
      }

      toast.success(
        "Parent account deleted.",
      );

      await loadParents();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete parent account.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function linkStudent(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (
      !selectedParent ||
      !studentId
    ) {
      toast.error(
        "Select a parent and student.",
      );

      return;
    }

    setBusy(true);

    try {
      const result =
        await apiRequest<{
          message: string;
        }>(
          `/admin/parents/${selectedParent.id}/students`,
          {
            method:
              "POST",

            body: {
              student_id:
                Number(
                  studentId,
                ),

              relationship:
                relationship.trim() ||
                null,

              is_primary:
                isPrimary,
            },
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not link student.",
        );
      }

      toast.success(
        "Student linked successfully.",
      );

      setStudentId("");
      setRelationship("");
      setIsPrimary(false);

      await loadParents(
        selectedParent.id,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not link student.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function unlinkStudent(
    student: LinkedStudent,
  ) {
    if (!selectedParent) {
      return;
    }

    const confirmed =
      window.confirm(
        `Unlink ${student.name} from ${selectedParent.name}?`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);

    try {
      const result =
        await apiRequest<{
          message: string;
        }>(
          `/admin/parents/${selectedParent.id}/students/${student.id}`,
          {
            method:
              "DELETE",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not unlink student.",
        );
      }

      toast.success(
        "Student unlinked.",
      );

      await loadParents(
        selectedParent.id,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not unlink student.",
      );
    } finally {
      setBusy(false);
    }
  }

  const stats =
    data?.stats;

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Parents"
      description="Manage parent and guardian accounts and their linked student accounts."
      showNotice={false}
      actions={
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          disabled={loading}
          onClick={() =>
            void loadParents(
              selectedParentId,
            )
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
      }
    >
      {error ? (
        <div
          role="alert"
          className="rounded-3xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {loading &&
      !data ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl border bg-card text-sm text-muted-foreground">
          Loading parent accounts...
        </div>
      ) : null}

      {data &&
      stats ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Parents"
              value={String(
                stats.parents,
              )}
              hint="Parent and guardian accounts"
              tone="primary"
            />

            <StatCard
              label="Linked students"
              value={String(
                stats.linked_students,
              )}
              hint="Unique students with a guardian"
              tone="success"
            />

            <StatCard
              label="Relationships"
              value={String(
                stats.relationships,
              )}
              hint="Parent-to-student links"
              tone="primary"
            />

            <StatCard
              label="Unlinked parents"
              value={String(
                stats.unlinked_parents,
              )}
              hint="Accounts needing a student link"
              tone="warning"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <section className="tile space-y-5 p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserPlus className="size-5" />
                </span>

                <div>
                  <h2 className="font-semibold">
                    {editingParentId
                      ? "Edit parent account"
                      : "Create parent account"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Parent accounts are created by an administrator. Public registration remains limited to students and teachers.
                  </p>
                </div>
              </div>

              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={
                  saveParent
                }
              >
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Name
                  </span>

                  <Input
                    required
                    value={name}
                    onChange={(
                      event,
                    ) =>
                      setName(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Parent or guardian name"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Email
                  </span>

                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    placeholder="parent@example.com"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Mobile
                  </span>

                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(
                      event,
                    ) =>
                      setMobile(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Optional"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    {editingParentId
                      ? "New password"
                      : "Initial password"}
                  </span>

                  <Input
                    required={
                      !editingParentId
                    }
                    minLength={8}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    placeholder={
                      editingParentId
                        ? "Leave blank to keep current password"
                        : "Minimum 8 characters"
                    }
                  />
                </label>

                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Button
                    type="submit"
                    disabled={
                      busy
                    }
                  >
                    <UserPlus className="size-4" />

                    {busy
                      ? "Saving..."
                      : editingParentId
                        ? "Update parent"
                        : "Create parent"}
                  </Button>

                  {editingParentId ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={
                        clearParentForm
                      }
                      disabled={
                        busy
                      }
                    >
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="tile space-y-4 p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
                  <HeartHandshake className="size-5" />
                </span>

                <div>
                  <h2 className="font-semibold">
                    Student relationship
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a parent below, then link a student account.
                  </p>
                </div>
              </div>

              {!selectedParent ? (
                <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  Create or select a parent account first.
                </p>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={
                    linkStudent
                  }
                >
                  <div className="rounded-2xl border bg-muted/30 p-3">
                    <p className="text-sm font-semibold">
                      {
                        selectedParent.name
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {
                        selectedParent.email
                      }
                    </p>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">
                      Student
                    </span>

                    <select
                      required
                      value={
                        studentId
                      }
                      onChange={(
                        event,
                      ) =>
                        setStudentId(
                          event
                            .target
                            .value,
                        )
                      }
                      className="h-11 w-full rounded-2xl border bg-background px-3 text-sm"
                    >
                      <option value="">
                        Select student
                      </option>

                      {data.students.map(
                        (
                          student,
                        ) => (
                          <option
                            key={
                              student.id
                            }
                            value={
                              student.id
                            }
                          >
                            {
                              student.name
                            }
                            {" — "}
                            {
                              student.email
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">
                      Relationship
                    </span>

                    <Input
                      value={
                        relationship
                      }
                      onChange={(
                        event,
                      ) =>
                        setRelationship(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Father, Mother, Guardian..."
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        isPrimary
                      }
                      onChange={(
                        event,
                      ) =>
                        setIsPrimary(
                          event
                            .target
                            .checked,
                        )
                      }
                      className="size-4"
                    />

                    <span>
                      Primary guardian for this student
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={
                      busy ||
                      !studentId
                    }
                  >
                    <Link2 className="size-4" />
                    Link student
                  </Button>
                </form>
              )}
            </section>
          </div>

          <section className="tile space-y-4 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Users className="size-5" />
                </span>

                <div>
                  <h2 className="font-semibold">
                    Parent accounts
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {
                      filteredParents.length
                    }{" "}
                    matching account
                    {filteredParents.length ===
                    1
                      ? ""
                      : "s"}
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  aria-label="Search parents"
                  className="pl-9"
                  placeholder="Search parent or student..."
                  value={search}
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event.target
                        .value,
                    )
                  }
                />
              </div>
            </div>

            {!filteredParents.length ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                {data.parents.length
                  ? "No parent accounts match your search."
                  : "No parent accounts have been created yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-3">
                        Parent
                      </th>

                      <th className="px-3 py-3">
                        Mobile
                      </th>

                      <th className="px-3 py-3">
                        Students
                      </th>

                      <th className="px-3 py-3">
                        Created
                      </th>

                      <th className="px-3 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredParents.map(
                      (
                        parent,
                      ) => {
                        const selected =
                          parent.id ===
                          selectedParentId;

                        return (
                          <tr
                            key={
                              parent.id
                            }
                            className={
                              selected
                                ? "border-b bg-primary/5"
                                : "border-b last:border-b-0"
                            }
                          >
                            <td className="px-3 py-4">
                              <button
                                type="button"
                                className="text-left"
                                onClick={() =>
                                  setSelectedParentId(
                                    parent.id,
                                  )
                                }
                              >
                                <p className="font-semibold hover:text-primary">
                                  {
                                    parent.name
                                  }
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {
                                    parent.email
                                  }
                                </p>
                              </button>
                            </td>

                            <td className="px-3 py-4 text-muted-foreground">
                              {parent.mobile ||
                                "—"}
                            </td>

                            <td className="px-3 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {parent.students.length ? (
                                  parent.students.map(
                                    (
                                      student,
                                    ) => (
                                      <Badge
                                        key={
                                          student.id
                                        }
                                        variant="outline"
                                        className="rounded-full"
                                      >
                                        {
                                          student.name
                                        }

                                        {student.is_primary
                                          ? " · Primary"
                                          : ""}
                                      </Badge>
                                    ),
                                  )
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="rounded-full text-muted-foreground"
                                  >
                                    Not linked
                                  </Badge>
                                )}
                              </div>
                            </td>

                            <td className="px-3 py-4 text-muted-foreground">
                              {formatDate(
                                parent.created_at,
                              )}
                            </td>

                            <td className="px-3 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedParentId(
                                      parent.id,
                                    );
                                  }}
                                >
                                  <HeartHandshake className="size-4" />
                                  Manage
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    beginEdit(
                                      parent,
                                    )
                                  }
                                >
                                  <Pencil className="size-4" />
                                  Edit
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:text-destructive"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    void deleteParent(
                                      parent,
                                    )
                                  }
                                >
                                  <Trash2 className="size-4" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="tile space-y-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HeartHandshake className="size-5" />
              </span>

              <div>
                <h2 className="font-semibold">
                  Linked students
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedParent
                    ? `Students linked to ${selectedParent.name}.`
                    : "Select a parent account to manage relationships."}
                </p>
              </div>
            </div>

            {!selectedParent ? (
              <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No parent selected.
              </p>
            ) : !selectedParent
                .students.length ? (
              <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                This parent does not have any linked students yet.
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {selectedParent.students.map(
                  (
                    student,
                  ) => (
                    <div
                      key={
                        student.link_id
                      }
                      className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">
                            {
                              student.name
                            }
                          </p>

                          {student.is_primary ? (
                            <Badge className="rounded-full">
                              Primary guardian
                            </Badge>
                          ) : null}
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            student.email
                          }
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                          Relationship:{" "}
                          <span className="font-medium text-foreground">
                            {student.relationship ||
                              "Not specified"}
                          </span>
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 text-destructive hover:text-destructive"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          void unlinkStudent(
                            student,
                          )
                        }
                      >
                        <Unlink className="size-4" />
                        Unlink
                      </Button>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </PortalPage>
  );
}