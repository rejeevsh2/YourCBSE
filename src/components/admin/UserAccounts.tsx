import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Loader2,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { apiRequest } from "@/lib/auth/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AccountRole =
  | "student"
  | "teacher";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
};

type UserResponse = {
  user?: User;
  users?: User[];
  message?: string;
};

export function UserAccounts({
  role,
}: {
  role?: AccountRole;
}) {
  const [users, setUsers] =
    useState<User[]>([]);

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

  const title =
    role === "student"
      ? "Students"
      : role === "teacher"
        ? "Teachers"
        : "User accounts";

  const description =
    role === "student"
      ? "Find, create and manage student accounts."
      : role === "teacher"
        ? "Find, create and manage teacher accounts."
        : "Find and manage student and teacher accounts.";

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

  async function create(
    event: FormEvent,
  ) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setStatus("");

    const accountRole =
      role ?? newRole;

    const result =
      await apiRequest<UserResponse>(
        "/admin/users",
        {
          body: {
            name,
            email,
            password,
            role: accountRole,
          },
        },
      );

    if (result.ok) {
      setName("");
      setEmail("");
      setPassword("");

      setStatus(
        `${
          accountRole === "student"
            ? "Student"
            : "Teacher"
        } account created.`,
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

    const accountRole =
      role ?? editRole;

    const result =
      await apiRequest<UserResponse>(
        `/admin/users/${editing.id}`,
        {
          method: "PATCH",
          body: {
            name: editName,
            email: editEmail,
            role: accountRole,
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

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title={title}
      description={description}
      showNotice={false}
    >
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
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t"
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

                <td className="p-2">
                  {user.role ===
                    "student" ||
                  user.role ===
                    "teacher" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        startEdit(user)
                      }
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Roles & Permissions
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {loaded &&
            users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  No matching accounts.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

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
        className="tile max-w-xl space-y-4 p-6"
      >
        <h2 className="text-xl font-bold">
          {role === "student"
            ? "Create student"
            : role === "teacher"
              ? "Create teacher"
              : "Create an account"}
        </h2>

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
          <label className="block">
            Role

            <select
              className="ml-3 rounded-lg border bg-background p-2"
              value={newRole}
              onChange={(event) =>
                setNewRole(
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
          ) : null}

          {busy
            ? "Creating..."
            : "Create account"}
        </Button>
      </form>
    </PortalPage>
  );
}