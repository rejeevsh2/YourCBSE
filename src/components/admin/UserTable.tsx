import { KeyRound, Pencil, ShieldOff, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/common/DataTable";
import { TablePagination } from "@/components/common/TablePagination";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { RowActions } from "@/components/teacher/RowActions";
import { AccountStatusBadge } from "@/components/admin/AdminBadges";
import type { AdminUser } from "@/data/admin";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

const columns: Column<AdminUser>[] = [
  {
    key: "user",
    header: "User",
    render: (row) => (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
            {initials(row.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{row.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (row) => (
      <div className="min-w-0">
        <p className="text-sm font-medium">{row.role}</p>
        <p className="truncate text-xs text-muted-foreground">{row.meta}</p>
      </div>
    ),
  },
  { key: "status", header: "Status", render: (row) => <AccountStatusBadge status={row.status} /> },
  {
    key: "lastLogin",
    header: "Last login",
    render: (row) => <span className="text-sm text-muted-foreground">{row.lastLogin}</span>,
  },
  {
    key: "joined",
    header: "Joined",
    className: "hidden xl:table-cell",
    render: (row) => <span className="text-sm text-muted-foreground">{row.joined}</span>,
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (row) => (
      <RowActions
        label={row.name}
        actions={[
          { label: "Edit profile", icon: Pencil },
          { label: "Reset password", icon: KeyRound },
          { label: "Activate", icon: ShieldCheck },
          { label: "Suspend", icon: ShieldOff, separatorBefore: true },
          { label: "Delete account", icon: Trash2, destructive: true },
        ]}
      />
    ),
  },
];

interface UserTableProps {
  rows: AdminUser[];
  caption: string;
  createLabel?: string;
}

/** Enterprise user-management table shared by Users / Students / Teachers / Parents. */
export function UserTable({ rows, caption, createLabel = "Create user" }: UserTableProps) {
  return (
    <div className="space-y-4">
      <StudioToolbar
        searchPlaceholder="Search by name or email…"
        filters={[
          { id: "role", label: "Role", options: ["All roles", "Super Admin", "Admin", "Teacher", "Student", "Parent"] },
          { id: "status", label: "Status", options: ["All statuses", "Active", "Pending", "Suspended", "Invited"] },
        ]}
        actions={
          <Button
            className="rounded-2xl"
            onClick={() =>
              toast(createLabel, { description: "Connects to the Laravel backend in a later phase." })
            }
          >
            <UserPlus className="size-4" /> {createLabel}
          </Button>
        }
      />
      <DataTable columns={columns} rows={rows} caption={caption} />
      <TablePagination totalPages={8} />
    </div>
  );
}

