import type { ReactNode } from "react";
import { Archive, Eye, History, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/common/DataTable";
import { TablePagination } from "@/components/common/TablePagination";
import { StudioToolbar, type FilterConfig } from "@/components/teacher/StudioToolbar";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { Badge } from "@/components/ui/badge";
import type { AdminContentItem } from "@/data/admin";

function notify(action: string, title: string) {
  toast(`${action}: ${title}`, {
    description: "Connects to the Laravel backend in a later phase.",
  });
}

const defaultFilters: FilterConfig[] = [
  { id: "status", label: "Status", options: ["All statuses", "Published", "Draft", "In review", "Archived"] },
  { id: "grade", label: "Grade", options: ["All grades", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"] },
];

const columns: Column<AdminContentItem>[] = [
  {
    key: "title",
    header: "Title",
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{row.title}</p>
        <p className="truncate text-xs text-muted-foreground">{row.context}</p>
      </div>
    ),
  },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  {
    key: "version",
    header: "Version",
    render: (row) => (
      <Badge variant="outline" className="rounded-full text-[11px]">
        {row.version}
      </Badge>
    ),
  },
  {
    key: "author",
    header: "Author",
    className: "hidden lg:table-cell",
    render: (row) => <span className="text-sm text-muted-foreground">{row.author}</span>,
  },
  {
    key: "updatedAt",
    header: "Updated",
    render: (row) => <span className="text-sm text-muted-foreground">{row.updatedAt}</span>,
  },
  {
    key: "views",
    header: "Views",
    className: "hidden xl:table-cell",
    render: (row) => <span className="text-sm text-muted-foreground">{row.views ?? "—"}</span>,
  },
  {
    key: "quick",
    header: "",
    className: "hidden md:table-cell",
    render: (row) => (
      <div className="flex justify-end gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="rounded-2xl"
          onClick={() => notify("Preview", row.title)}
        >
          <Eye className="size-4" /> Preview
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-2xl"
          onClick={() => notify("Publish", row.title)}
        >
          Publish
        </Button>
      </div>
    ),
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (row) => (
      <RowActions
        label={row.title}
        actions={[
          { label: "Edit", icon: Pencil },
          { label: "Preview", icon: Eye },
          { label: "Version history", icon: History },
          { label: "Archive", icon: Archive, separatorBefore: true },
          { label: "Delete", icon: Trash2, destructive: true },
        ]}
      />
    ),
  },
];

interface ContentManagerProps {
  items: AdminContentItem[];
  caption: string;
  createLabel: string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  extraActions?: ReactNode;
  showUpload?: boolean;
}

/** Shared content-management surface: toolbar + status/version table + pagination. */
export function ContentManager({
  items,
  caption,
  createLabel,
  searchPlaceholder = "Search content…",
  filters = defaultFilters,
  extraActions,
  showUpload = false,
}: ContentManagerProps) {
  return (
    <div className="space-y-4">
      <StudioToolbar
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        actions={
          <div className="flex flex-wrap gap-2">
            {extraActions}
            {showUpload ? (
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => notify("Upload", caption)}
              >
                <Upload className="size-4" /> Upload
              </Button>
            ) : null}
            <Button className="rounded-2xl" onClick={() => notify(createLabel, caption)}>
              <Plus className="size-4" /> {createLabel}
            </Button>
          </div>
        }
      />
      <DataTable columns={columns} rows={items} caption={caption} />
      <TablePagination totalPages={6} />
    </div>
  );
}

