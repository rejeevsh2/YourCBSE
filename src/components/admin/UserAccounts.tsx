import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { apiRequest } from "@/lib/auth/http";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type AccountRole =
  | "student"
  | "teacher";

type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

type Grade = {
  id: number;
  name: string;
  grade_number: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  approval_status?: ApprovalStatus;
  approved_at?: string | null;
  grades?: Grade[];
  created_at?: string;
};

type UserResponse = {
  user?: User;
  users?: User[];
  message?: string;
};

type GradesResponse = {
  grades?: Grade[];
};

function classNames(user: User) {
  if (!user.grades?.length) {
    return "Not assigned";
  }

  return user.grades
    .map((grade) => grade.name)
    .join(", ");
}

export function UserAccounts({
  role,
}: {
  role?: AccountRole;
}) {
  const [users, setUsers] =
    useState<User[]>([]);

  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [loaded, setLoaded] =
    useState(false);

  const [busy, setBusy] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [newRole, setNewRole] =
    useState<AccountRole>(
      role ?? "student",
    );

  const [newGradeIds, setNewGradeIds] =
    useState<number[]>([]);

  const [editing, setEditing] =
    useState<User | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [editPassword, setEditPassword] =
    useState("");

  const [editRole, setEditRole] =
    useState<AccountRole>("student");

  const [reviewing, setReviewing] =
    useState<User | null>(null);

  const [reviewGradeIds, setReviewGradeIds] =
    useState<number[]>([]);

  const accountRole =
    role ?? newRole;

  const title =
    role === "student"
      ? "Students"
      : role === "teacher"
        ? "Teachers"
        : "User accounts";

  const description =
    role === "student"
      ? "Review, approve and manage student accounts."
      : role === "teacher"
        ? "Review, approve and manage teacher accounts."
        : "Review, approve and manage student and teacher accounts.";

  const pendingCount = useMemo(
    () =>
      users.filter(
        (user) =>
          user.approval_status === "pending",
      ).length,
    [users],
  );

  const load = useCallback(
    async (term = "") => {
      setError("");

      const params =
        new URLSearchParams();

      if (term.trim()) {
        params.set(
          "search",
          term.trim(),
        );
      }

      if (role) {
        params.set("role", role);
      }

      const query =
        params.toString();

      const endpoint =
        query
          ? `/admin/users?${query}`
          : "/admin/users";

      const result =
        await apiRequest<UserResponse>(
          endpoint,
          {
            method: "GET",
          },
        );

      if (
        result.ok &&
        result.data
      ) {
        setUsers(
          result.data.users ?? [],
        );

        setLoaded(true);
        return;
      }

      setError(
        result.message ??
          "Unable to load accounts.",
      );
    },
    [role],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    async function loadGrades() {
      const result =
        await apiRequest<GradesResponse>(
          "/registration/grades",
          {
            method: "GET",
          },
        );

      if (cancelled) {
        return;
      }

      if (
        result.ok &&
        result.data
      ) {
        setGrades(
          result.data.grades ?? [],
        );

        return;
      }

      setError(
        result.message ??
          "Unable to load classes.",
      );
    }

    void loadGrades();

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleId(
    current: number[],
    id: number,
    checked: boolean,
  ) {
    return checked
      ? Array.from(
          new Set([
            ...current,
            id,
          ]),
        )
      : current.filter(
          (value) =>
            value !== id,
        );
  }

  function resetNewGrades(
    nextRole: AccountRole,
  ) {
    setNewGradeIds(
      nextRole === "student"
        ? []
        : newGradeIds,
    );
  }

  async function create(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      accountRole === "student" &&
      newGradeIds.length !== 1
    ) {
      setError(
        "Select exactly one class for the student.",
      );
      return;
    }

    if (
      accountRole === "teacher" &&
      newGradeIds.length < 1
    ) {
      setError(
        "Select at least one class for the teacher.",
      );
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");

    const result =
      await apiRequest<UserResponse>(
        "/admin/users",
        {
          body: {
            name,
            email,
            password,
            role: accountRole,
            grade_ids:
              newGradeIds,
          },
        },
      );

    if (result.ok) {
      setName("");
      setEmail("");
      setPassword("");
      setNewGradeIds([]);

      setStatus(
        `${
          accountRole === "student"
            ? "Student"
            : "Teacher"
        } account created and approved.`,
      );

      await load(search);
    } else {
      setError(
        result.message ??
          "Unable to create account.",
      );
    }

    setBusy(false);
  }

  function startEdit(
    user: User,
  ) {
    if (
      user.role !== "student" &&
      user.role !== "teacher"
    ) {
      setError(
        "Admin accounts are managed through Roles & Permissions.",
      );

      return;
    }

    setError("");
    setStatus("");
    setReviewing(null);

    setEditing(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");

    setEditRole(
      user.role as AccountRole,
    );
  }

  function cancelEdit() {
    setEditing(null);
    setEditPassword("");
  }

  async function updateAccount(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!editing) {
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");

    const nextRole =
      role ?? editRole;

    const result =
      await apiRequest<UserResponse>(
        `/admin/users/${editing.id}`,
        {
          method: "PATCH",
          body: {
            name: editName,
            email: editEmail,
            role: nextRole,
            password:
              editPassword.trim() ||
              null,
          },
        },
      );

    if (result.ok) {
      setStatus(
        "Account updated.",
      );

      setEditing(null);
      setEditPassword("");

      await load(search);
    } else {
      setError(
        result.message ??
          "Unable to update account.",
      );
    }

    setBusy(false);
  }

  function startReview(
    user: User,
  ) {
    if (
      user.role !== "student" &&
      user.role !== "teacher"
    ) {
      return;
    }

    setEditing(null);
    setError("");
    setStatus("");
    setReviewing(user);

    setReviewGradeIds(
      (user.grades ?? [])
        .map((grade) => grade.id),
    );
  }

  function cancelReview() {
    setReviewing(null);
    setReviewGradeIds([]);
  }

  async function updateApproval(
    nextStatus:
      | "approved"
      | "rejected",
  ) {
    if (!reviewing) {
      return;
    }

    if (
      nextStatus === "approved" &&
      reviewing.role === "student" &&
      reviewGradeIds.length !== 1
    ) {
      setError(
        "Select exactly one class before approving this student.",
      );
      return;
    }

    if (
      nextStatus === "approved" &&
      reviewing.role === "teacher" &&
      reviewGradeIds.length < 1
    ) {
      setError(
        "Select at least one class before approving this teacher.",
      );
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");

    try {
      const result =
        await apiRequest<UserResponse>(
          `/admin/users/${reviewing.id}/approval`,
          {
            method: "PATCH",
            body: {
              status: nextStatus,
              grade_ids:
                nextStatus === "approved"
                  ? reviewGradeIds
                  : [],
            },
          },
        );

      if (result.ok) {
        setStatus(
          nextStatus === "approved"
            ? reviewing.approval_status === "approved"
              ? "Classes updated."
              : "Account approved."
            : "Account rejected.",
        );

        cancelReview();
        await load(search);
      } else {
        setError(
          result.message ??
            "Unable to update approval.",
        );
      }
    } catch {
      setError(
        "Unable to update approval.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title={title}
      description={description}
      showNotice={false}
    >
      {pendingCount > 0 ? (
        <div
          role="status"
          className="tile flex items-center gap-3 p-4"
        >
          <ShieldCheck className="size-5 text-primary" />
          <p className="text-sm">
            <strong>
              {pendingCount}
            </strong>{" "}
            account
            {pendingCount === 1
              ? ""
              : "s"}{" "}
            waiting for approval in this list.
          </p>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="tile p-4 text-destructive"
        >
          {error}
        </p>
      ) : null}

      {status ? (
        <p
          role="status"
          className="tile p-4 text-sm"
        >
          {status}
        </p>
      ) : null}

      <form
        className="flex gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void load(search);
        }}
      >
        <Input
          aria-label="Search name or email"
          placeholder="Search name or email"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
        />

        <Button type="submit">
          Search
        </Button>
      </form>

      <section className="tile overflow-x-auto p-5">
        <table className="w-full text-left">
          <caption className="mb-3 text-left">
            {loaded
              ? "Matching accounts (up to 200)"
              : "Loading accounts..."}
          </caption>

          <thead>
            <tr>
              <th className="p-2">
                Name
              </th>
              <th className="p-2">
                Email
              </th>
              <th className="p-2">
                Role
              </th>
              <th className="p-2">
                Status
              </th>
              <th className="p-2">
                Classes
              </th>
              <th className="p-2">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const approval =
                user.approval_status ??
                "approved";

              return (
                <tr
                  key={user.id}
                  className="border-t align-top"
                >
                  <td className="p-2">
                    {user.name}
                  </td>

                  <td className="p-2">
                    {user.email}
                  </td>

                  <td className="p-2 capitalize">
                    {user.role}
                  </td>

                  <td className="p-2 capitalize">
                    {approval}
                  </td>

                  <td className="p-2 text-sm">
                    {classNames(user)}
                  </td>

                  <td className="p-2">
                    {user.role ===
                      "student" ||
                    user.role ===
                      "teacher" ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            approval === "approved"
                              ? "outline"
                              : "default"
                          }
                          onClick={() => startReview(user)}
                        >
                          <ShieldCheck className="size-4" />
                          {approval === "approved"
                            ? "Classes"
                            : "Review"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            startEdit(
                              user,
                            )
                          }
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Roles & Permissions
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {loaded &&
            users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  No matching accounts.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      {reviewing ? (
        <section className="tile max-w-2xl space-y-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                {reviewing.approval_status === "approved" ? "Manage classes" : "Review account"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {reviewing.name} ·{" "}
                <span className="capitalize">
                  {reviewing.role}
                </span>
              </p>
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={reviewing.approval_status === "approved" ? "Close classes" : "Close review"}
              onClick={cancelReview}
            >
              <X className="size-4" />
            </Button>
          </div>

          {reviewing.role ===
          "student" ? (
            <label className="block space-y-2">
              <span className="font-medium">
                Assign one class
              </span>

              <select
                className="w-full rounded-lg border bg-background p-2"
                value={
                  reviewGradeIds[0] ??
                  ""
                }
                onChange={(event) =>
                  setReviewGradeIds(
                    event.target.value
                      ? [
                          Number(
                            event.target
                              .value,
                          ),
                        ]
                      : [],
                  )
                }
              >
                <option value="">
                  Select class
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
          ) : (
            <div className="space-y-3">
              <div>
                <p className="font-medium">
                  Classes
                </p>

                <p className="text-sm text-muted-foreground">
                  {reviewing.approval_status === "approved"
                    ? "Select the classes this teacher should be able to access."
                    : "The teacher requested the checked classes. Adjust them if needed before approval."}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {grades.map((grade) => {
                  const checked =
                    reviewGradeIds.includes(
                      grade.id,
                    );

                  return (
                    <label
                      key={grade.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          setReviewGradeIds(
                            (current) =>
                              toggleId(
                                current,
                                grade.id,
                                value ===
                                  true,
                              ),
                          )
                        }
                      />

                      <span className="text-sm">
                        {grade.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={busy}
              onClick={() =>
                void updateApproval(
                  "approved",
                )
              }
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {reviewing.approval_status === "approved"
                ? "Save classes"
                : "Approve"}
            </Button>

            {reviewing.approval_status === "approved" ? (
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={cancelReview}
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() =>
                  void updateApproval(
                    "rejected",
                  )
                }
              >
                <XCircle className="size-4" />
                Reject
              </Button>
            )}
          </div>
        </section>
      ) : null}

      {editing ? (
        <form
          onSubmit={updateAccount}
          className="tile max-w-xl space-y-4 p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                Edit account
              </h2>

              <p className="text-sm text-muted-foreground">
                User #{editing.id}
              </p>
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={cancelEdit}
            >
              <X className="size-4" />
            </Button>
          </div>

          <label className="block space-y-1">
            <span>Name</span>

            <Input
              required
              value={editName}
              onChange={(event) =>
                setEditName(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="block space-y-1">
            <span>Email</span>

            <Input
              required
              type="email"
              value={editEmail}
              onChange={(event) =>
                setEditEmail(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="block space-y-1">
            <span>
              New password
            </span>

            <Input
              type="password"
              minLength={8}
              autoComplete="new-password"
              placeholder="Leave blank to keep current password"
              value={editPassword}
              onChange={(event) =>
                setEditPassword(
                  event.target.value,
                )
              }
            />
          </label>

          {role ? (
            <div>
              <p className="text-sm">
                Role
              </p>

              <p className="mt-1 font-medium capitalize">
                {role}
              </p>
            </div>
          ) : (
            <label className="block">
              Role

              <select
                className="ml-3 rounded-lg border bg-background p-2"
                value={editRole}
                onChange={(event) =>
                  setEditRole(
                    event.target
                      .value as AccountRole,
                  )
                }
              >
                <option value="student">
                  Student
                </option>

                <option value="teacher">
                  Teacher
                </option>
              </select>
            </label>
          )}

          <Button
            type="submit"
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            {busy
              ? "Saving..."
              : "Save changes"}
          </Button>
        </form>
      ) : null}

      <form
        onSubmit={create}
        className="tile max-w-2xl space-y-4 p-6"
      >
        <h2 className="text-xl font-bold">
          {role === "student"
            ? "Create student"
            : role === "teacher"
              ? "Create teacher"
              : "Create an account"}
        </h2>

        <p className="text-sm text-muted-foreground">
          Accounts created by an administrator are approved immediately.
        </p>

        <label className="block space-y-1">
          <span>Name</span>

          <Input
            required
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
          />
        </label>

        <label className="block space-y-1">
          <span>Email</span>

          <Input
            required
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
          />
        </label>

        <label className="block space-y-1">
          <span>
            Initial password
          </span>

          <Input
            required
            minLength={8}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
          />
        </label>

        {role ? (
          <div>
            <p className="text-sm">
              Role
            </p>

            <p className="mt-1 font-medium capitalize">
              {role}
            </p>
          </div>
        ) : (
          <label className="block space-y-1">
            <span>Role</span>

            <select
              className="w-full rounded-lg border bg-background p-2"
              value={newRole}
              onChange={(event) => {
                const nextRole =
                  event.target
                    .value as AccountRole;

                setNewRole(
                  nextRole,
                );

                resetNewGrades(
                  nextRole,
                );
              }}
            >
              <option value="student">
                Student
              </option>

              <option value="teacher">
                Teacher
              </option>
            </select>
          </label>
        )}

        {accountRole ===
        "student" ? (
          <label className="block space-y-2">
            <span>
              Class
            </span>

            <select
              className="w-full rounded-lg border bg-background p-2"
              value={
                newGradeIds[0] ??
                ""
              }
              onChange={(event) =>
                setNewGradeIds(
                  event.target.value
                    ? [
                        Number(
                          event.target
                            .value,
                        ),
                      ]
                    : [],
                )
              }
            >
              <option value="">
                Select class
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
        ) : (
          <div className="space-y-2">
            <p>
              Classes
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {grades.map((grade) => {
                const checked =
                  newGradeIds.includes(
                    grade.id,
                  );

                return (
                  <label
                    key={grade.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        setNewGradeIds(
                          (current) =>
                            toggleId(
                              current,
                              grade.id,
                              value === true,
                            ),
                        )
                      }
                    />

                    <span className="text-sm">
                      {grade.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}

          {busy
            ? "Creating..."
            : "Create account"}
        </Button>
      </form>
    </PortalPage>
  );
}
