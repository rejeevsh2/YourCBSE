import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  LockKeyhole,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      {
        title: "Roles & Permissions ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â YourTeacher Admin",
      },
      {
        name: "description",
        content:
          "Manage administrative roles, permissions and admin role assignments.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminRolesPage,
});

type Permission = {
  id: number;
  key: string;
  label: string;
  module: string;
  description: string | null;
};

type AdminRole = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  members: number;
  permission_keys: string[];
};

type AssignedRole = {
  id: number;
  name: string;
  slug: string;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
  role_ids: number[];
  roles: AssignedRole[];
};

type PlatformRole = {
  key: string;
  label: string;
  members: number;
};

type RbacResponse = {
  roles: AdminRole[];
  permissions: Permission[];
  admins: AdminUser[];
  platform_roles: PlatformRole[];
};

function AdminRolesPage() {
  const [data, setData] =
    useState<RbacResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useState<number | null>(null);

  const [creating, setCreating] =
    useState(false);

  const [roleName, setRoleName] =
    useState("");

  const [
    roleDescription,
    setRoleDescription,
  ] = useState("");

  const [
    permissionKeys,
    setPermissionKeys,
  ] = useState<string[]>([]);

  const [
    selectedAdminId,
    setSelectedAdminId,
  ] = useState<number | null>(null);

  const [
    adminRoleIds,
    setAdminRoleIds,
  ] = useState<number[]>([]);

  const loadRbac =
    useCallback(
      async (
        preferredRoleId?:
          number | null,
      ) => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await apiRequest<RbacResponse>(
              "/admin/rbac",
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
                "Could not load roles and permissions.",
            );
          }

          const next = result.data;

          setData(next);

          setSelectedRoleId(
            (current) => {
              const preferred =
                preferredRoleId ??
                current;

              if (
                preferred &&
                next.roles.some(
                  (role) =>
                    role.id ===
                    preferred,
                )
              ) {
                return preferred;
              }

              return (
                next.roles[0]
                  ?.id ?? null
              );
            },
          );

          setSelectedAdminId(
            (current) => {
              if (
                current &&
                next.admins.some(
                  (admin) =>
                    admin.id ===
                    current,
                )
              ) {
                return current;
              }

              return (
                next.admins[0]
                  ?.id ?? null
              );
            },
          );
        } catch (err) {
          console.error(
            "RBAC load error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Could not load roles and permissions.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadRbac();
  }, [loadRbac]);

  const selectedRole =
    useMemo(
      () =>
        data?.roles.find(
          (role) =>
            role.id ===
            selectedRoleId,
        ) ?? null,
      [
        data?.roles,
        selectedRoleId,
      ],
    );

  const selectedAdmin =
    useMemo(
      () =>
        data?.admins.find(
          (admin) =>
            admin.id ===
            selectedAdminId,
        ) ?? null,
      [
        data?.admins,
        selectedAdminId,
      ],
    );

  useEffect(() => {
    if (
      creating ||
      !selectedRole
    ) {
      return;
    }

    setRoleName(
      selectedRole.name,
    );

    setRoleDescription(
      selectedRole.description ??
        "",
    );

    setPermissionKeys(
      selectedRole.permission_keys,
    );
  }, [
    creating,
    selectedRole,
  ]);

  useEffect(() => {
    if (!selectedAdmin) {
      setAdminRoleIds([]);
      return;
    }

    setAdminRoleIds(
      selectedAdmin.role_ids,
    );
  }, [selectedAdmin]);

  function beginNewRole() {
    setCreating(true);
    setSelectedRoleId(null);
    setRoleName("");
    setRoleDescription("");

    const dashboardPermission =
      data?.permissions.find(
        (permission) =>
          permission.key ===
          "dashboard.view",
      );

    setPermissionKeys(
      dashboardPermission
        ? [
            dashboardPermission.key,
          ]
        : [],
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function selectRole(
    role: AdminRole,
  ) {
    setCreating(false);
    setSelectedRoleId(
      role.id,
    );
  }

  function cancelRoleEdit() {
    setCreating(false);

    const firstRole =
      data?.roles[0];

    setSelectedRoleId(
      selectedRole?.id ??
        firstRole?.id ??
        null,
    );
  }

  function togglePermission(
    key: string,
  ) {
    if (
      selectedRole?.slug ===
      "super-admin"
    ) {
      return;
    }

    setPermissionKeys(
      (current) =>
        current.includes(key)
          ? current.filter(
              (item) =>
                item !== key,
            )
          : [
              ...current,
              key,
            ],
    );
  }

  async function saveRole(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!roleName.trim()) {
      toast.error(
        "Role name is required.",
      );

      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (creating) {
        const result =
          await apiRequest<{
            message: string;
            role_id: number;
          }>(
            "/admin/rbac/roles",
            {
              method: "POST",
              body: {
                name:
                  roleName.trim(),

                description:
                  roleDescription
                    .trim() ||
                  null,

                permission_keys:
                  permissionKeys,
              },
            },
          );

        if (
          !result.ok ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              "Could not create role.",
          );
        }

        toast.success(
          "Admin role created.",
        );

        setCreating(false);

        await loadRbac(
          result.data.role_id,
        );

        return;
      }

      if (!selectedRole) {
        return;
      }

      const roleResult =
        await apiRequest<{
          message: string;
        }>(
          `/admin/rbac/roles/${selectedRole.id}`,
          {
            method: "PUT",
            body: {
              name:
                roleName.trim(),

              description:
                roleDescription
                  .trim() ||
                null,
            },
          },
        );

      if (!roleResult.ok) {
        throw new Error(
          roleResult.message ||
            "Could not update role.",
        );
      }

      if (
        selectedRole.slug !==
        "super-admin"
      ) {
        const permissionResult =
          await apiRequest<{
            message: string;
          }>(
            `/admin/rbac/roles/${selectedRole.id}/permissions`,
            {
              method: "PUT",
              body: {
                permission_keys:
                  permissionKeys,
              },
            },
          );

        if (
          !permissionResult.ok
        ) {
          throw new Error(
            permissionResult.message ||
              "Role was updated, but permissions could not be saved.",
          );
        }
      }

      toast.success(
        "Role and permissions updated.",
      );

      await loadRbac(
        selectedRole.id,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not save role.";

      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteRole(
    role: AdminRole,
  ) {
    if (role.is_system) {
      toast.error(
        "System roles cannot be deleted.",
      );

      return;
    }

    if (role.members > 0) {
      toast.error(
        "Remove this role from all admin users before deleting it.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete admin role "${role.name}"?`,
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
          `/admin/rbac/roles/${role.id}`,
          {
            method: "DELETE",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete role.",
        );
      }

      toast.success(
        "Admin role deleted.",
      );

      setSelectedRoleId(
        null,
      );

      setCreating(false);

      await loadRbac();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete role.",
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleAdminRole(
    roleId: number,
  ) {
    setAdminRoleIds(
      (current) =>
        current.includes(roleId)
          ? current.filter(
              (id) =>
                id !== roleId,
            )
          : [
              ...current,
              roleId,
            ],
    );
  }

  async function saveAdminRoles() {
    if (!selectedAdmin) {
      return;
    }

    if (
      adminRoleIds.length === 0
    ) {
      toast.error(
        "An admin must have at least one administrative role.",
      );

      return;
    }

    setBusy(true);

    try {
      const result =
        await apiRequest<{
          message: string;
        }>(
          `/admin/rbac/users/${selectedAdmin.id}/roles`,
          {
            method: "PUT",
            body: {
              role_ids:
                adminRoleIds,
            },
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not update admin role assignments.",
        );
      }

      toast.success(
        "Admin role assignments updated.",
      );

      await loadRbac(
        selectedRoleId,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update admin role assignments.",
      );
    } finally {
      setBusy(false);
    }
  }

  const groupedPermissions =
    useMemo(() => {
      const groups =
        new Map<
          string,
          Permission[]
        >();

      for (
        const permission of
          data?.permissions ?? []
      ) {
        const current =
          groups.get(
            permission.module,
          ) ?? [];

        current.push(
          permission,
        );

        groups.set(
          permission.module,
          current,
        );
      }

      return Array.from(
        groups.entries(),
      );
    }, [data?.permissions]);

  const totalAssignments =
    useMemo(
      () =>
        data?.roles.reduce(
          (
            total,
            role,
          ) =>
            total +
            role.members,
          0,
        ) ?? 0,
      [data?.roles],
    );

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Roles & Permissions"
      description="Manage administrative access without changing student, teacher, parent or admin portal roles."
      showNotice={false}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={loading}
            onClick={() =>
              void loadRbac(
                selectedRoleId,
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

          <Button
            type="button"
            className="rounded-2xl"
            onClick={
              beginNewRole
            }
          >
            <Plus className="size-4" />
            New role
          </Button>
        </div>
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
          Loading roles and permissions...
        </div>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Admin roles"
              value={String(
                data.roles.length,
              )}
              hint="Administrative RBAC roles"
              tone="primary"
            />

            <StatCard
              label="Permissions"
              value={String(
                data.permissions
                  .length,
              )}
              hint="Granular admin permissions"
              tone="success"
            />

            <StatCard
              label="Admin users"
              value={String(
                data.admins.length,
              )}
              hint="Platform users with admin role"
              tone="primary"
            />

            <StatCard
              label="Role assignments"
              value={String(
                totalAssignments,
              )}
              hint="Admin-to-role assignments"
              tone="warning"
            />
          </div>

          <section className="tile space-y-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Users className="size-5" />
              </span>

              <div>
                <h2 className="font-semibold">
                  Platform roles
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  These remain the main login and portal roles. RBAC below applies only to Admin users.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {data.platform_roles.map(
                (role) => (
                  <div
                    key={
                      role.key
                    }
                    className="rounded-2xl border p-4"
                  >
                    <p className="text-sm font-semibold">
                      {
                        role.label
                      }
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {
                        role.members
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      accounts
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="tile space-y-4 p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>

                <div>
                  <h2 className="font-semibold">
                    Administrative roles
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a role to edit its permissions.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {data.roles.map(
                  (role) => {
                    const selected =
                      !creating &&
                      role.id ===
                        selectedRoleId;

                    return (
                      <button
                        type="button"
                        key={
                          role.id
                        }
                        onClick={() =>
                          selectRole(
                            role,
                          )
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">
                                {
                                  role.name
                                }
                              </p>

                              {role.is_system ? (
                                <Badge
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  System
                                </Badge>
                              ) : null}
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {role.description ||
                                "No description"}
                            </p>
                          </div>

                          <Badge className="shrink-0 rounded-full">
                            {
                              role.members
                            }{" "}
                            member
                            {role.members ===
                            1
                              ? ""
                              : "s"}
                          </Badge>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                          {
                            role.permission_keys
                              .length
                          }{" "}
                          permissions
                        </p>
                      </button>
                    );
                  },
                )}
              </div>
            </section>

            <section className="tile space-y-5 p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
                  {selectedRole?.slug ===
                  "super-admin" ? (
                    <LockKeyhole className="size-5" />
                  ) : (
                    <ShieldCheck className="size-5" />
                  )}
                </span>

                <div>
                  <h2 className="font-semibold">
                    {creating
                      ? "Create administrative role"
                      : selectedRole
                        ? `Edit ${selectedRole.name}`
                        : "Role editor"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedRole?.slug ===
                    "super-admin"
                      ? "Super Admin always has every administrative permission."
                      : "Choose exactly which administrative modules this role may manage."}
                  </p>
                </div>
              </div>

              <form
                className="space-y-5"
                onSubmit={
                  saveRole
                }
              >
                <label className="block space-y-2">
                  <span className="text-sm font-medium">
                    Role name
                  </span>

                  <Input
                    required
                    maxLength={100}
                    disabled={
                      Boolean(
                        selectedRole?.is_system,
                      ) &&
                      !creating
                    }
                    value={
                      roleName
                    }
                    onChange={(
                      event,
                    ) =>
                      setRoleName(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Content Admin"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">
                    Description
                  </span>

                  <Textarea
                    maxLength={500}
                    value={
                      roleDescription
                    }
                    onChange={(
                      event,
                    ) =>
                      setRoleDescription(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Describe what this administrative role is responsible for."
                  />
                </label>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Permissions
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {
                        permissionKeys.length
                      }{" "}
                      of{" "}
                      {
                        data.permissions
                          .length
                      }{" "}
                      selected
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {groupedPermissions.map(
                      ([
                        module,
                        permissions,
                      ]) => (
                        <div
                          key={
                            module
                          }
                          className="rounded-2xl border p-4"
                        >
                          <p className="mb-3 text-sm font-semibold">
                            {
                              module
                            }
                          </p>

                          <div className="space-y-3">
                            {permissions.map(
                              (
                                permission,
                              ) => {
                                const checked =
                                  selectedRole?.slug ===
                                    "super-admin" ||
                                  permissionKeys.includes(
                                    permission.key,
                                  );

                                return (
                                  <label
                                    key={
                                      permission.key
                                    }
                                    className="flex cursor-pointer items-start gap-3"
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-1 size-4"
                                      checked={
                                        checked
                                      }
                                      disabled={
                                        selectedRole?.slug ===
                                        "super-admin"
                                      }
                                      onChange={() =>
                                        togglePermission(
                                          permission.key,
                                        )
                                      }
                                    />

                                    <span className="min-w-0">
                                      <span className="block text-sm font-medium">
                                        {
                                          permission.label
                                        }
                                      </span>

                                      {permission.description ? (
                                        <span className="block text-xs text-muted-foreground">
                                          {
                                            permission.description
                                          }
                                        </span>
                                      ) : null}
                                    </span>
                                  </label>
                                );
                              },
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={
                      busy ||
                      (!creating &&
                        !selectedRole)
                    }
                  >
                    <Save className="size-4" />

                    {busy
                      ? "Saving..."
                      : creating
                        ? "Create role"
                        : "Save changes"}
                  </Button>

                  {creating ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={
                        cancelRoleEdit
                      }
                    >
                      Cancel
                    </Button>
                  ) : null}

                  {!creating &&
                  selectedRole &&
                  !selectedRole.is_system ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      disabled={
                        busy ||
                        selectedRole.members >
                          0
                      }
                      onClick={() =>
                        void deleteRole(
                          selectedRole,
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                      Delete role
                    </Button>
                  ) : null}
                </div>

                {!creating &&
                selectedRole &&
                !selectedRole.is_system &&
                selectedRole.members >
                  0 ? (
                  <p className="text-xs text-muted-foreground">
                    Remove this role from its admin users before deleting it.
                  </p>
                ) : null}
              </form>
            </section>
          </div>

          <section className="tile space-y-5 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Users className="size-5" />
              </span>

              <div>
                <h2 className="font-semibold">
                  Admin role assignments
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Assign one or more administrative roles to each user whose platform role is Admin.
                </p>
              </div>
            </div>

            {data.admins.length ===
            0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No Admin users are available.
              </p>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)]">
                <div className="space-y-2">
                  {data.admins.map(
                    (admin) => (
                      <button
                        type="button"
                        key={
                          admin.id
                        }
                        className={`w-full rounded-2xl border p-4 text-left ${
                          admin.id ===
                          selectedAdminId
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/40"
                        }`}
                        onClick={() =>
                          setSelectedAdminId(
                            admin.id,
                          )
                        }
                      >
                        <p className="font-semibold">
                          {
                            admin.name
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            admin.email
                          }
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {admin.roles.map(
                            (
                              role,
                            ) => (
                              <Badge
                                key={
                                  role.id
                                }
                                variant="outline"
                                className="rounded-full"
                              >
                                {
                                  role.name
                                }
                              </Badge>
                            ),
                          )}
                        </div>
                      </button>
                    ),
                  )}
                </div>

                {selectedAdmin ? (
                  <div className="rounded-2xl border p-5">
                    <h3 className="font-semibold">
                      {
                        selectedAdmin.name
                      }
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {
                        selectedAdmin.email
                      }
                    </p>

                    <div className="mt-5 space-y-3">
                      {data.roles.map(
                        (role) => (
                          <label
                            key={
                              role.id
                            }
                            className="flex items-start gap-3 rounded-2xl border p-3"
                          >
                            <input
                              type="checkbox"
                              className="mt-1 size-4"
                              checked={adminRoleIds.includes(
                                role.id,
                              )}
                              onChange={() =>
                                toggleAdminRole(
                                  role.id,
                                )
                              }
                            />

                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                {
                                  role.name
                                }

                                {role.is_system ? (
                                  <Badge
                                    variant="outline"
                                    className="rounded-full text-[10px]"
                                  >
                                    System
                                  </Badge>
                                ) : null}
                              </span>

                              <span className="mt-1 block text-xs text-muted-foreground">
                                {role.description ||
                                  "No description"}
                              </span>
                            </span>
                          </label>
                        ),
                      )}
                    </div>

                    <Button
                      type="button"
                      className="mt-5"
                      disabled={
                        busy ||
                        adminRoleIds.length ===
                          0
                      }
                      onClick={() =>
                        void saveAdminRoles()
                      }
                    >
                      <Save className="size-4" />
                      Save assignments
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className="tile space-y-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </span>

              <div>
                <h2 className="font-semibold">
                  Permission matrix
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Live permission assignments stored in the database.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-52">
                      Permission
                    </TableHead>

                    {data.roles.map(
                      (role) => (
                        <TableHead
                          key={
                            role.id
                          }
                          className="min-w-32 text-center"
                        >
                          {
                            role.name
                          }
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.permissions.map(
                    (
                      permission,
                    ) => (
                      <TableRow
                        key={
                          permission.key
                        }
                      >
                        <TableCell>
                          <p className="font-medium">
                            {
                              permission.label
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              permission.key
                            }
                          </p>
                        </TableCell>

                        {data.roles.map(
                          (role) => {
                            const allowed =
                              role.slug ===
                                "super-admin" ||
                              role.permission_keys.includes(
                                permission.key,
                              );

                            return (
                              <TableCell
                                key={
                                  role.id
                                }
                                className="text-center"
                              >
                                {allowed ? (
                                  <Check
                                    className="mx-auto size-4 text-success"
                                    aria-label={`${role.name} allowed`}
                                  />
                                ) : (
                                  <X
                                    className="mx-auto size-4 text-muted-foreground"
                                    aria-label={`${role.name} denied`}
                                  />
                                )}
                              </TableCell>
                            );
                          },
                        )}
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      ) : null}
    </PortalPage>
  );
}