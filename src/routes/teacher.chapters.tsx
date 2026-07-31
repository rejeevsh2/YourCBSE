import { createFileRoute } from "@tanstack/react-router";
import { Archive, Copy, Eye, Pencil, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studioChapters, type StudioChapter } from "@/data/teacher";

export const Route = createFileRoute("/teacher/chapters")({
  head: () => ({
    meta: [
      { title: "Chapter Manager — Teacher Studio" },
      { name: "description", content: "Create, version and publish chapters." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChapterManager,
});

const columns: Column<StudioChapter>[] = [
  {
    key: "title",
    header: "Chapter",
    render: (row) => (
      <div className="min-w-[10rem]">
        <p className="font-semibold">{row.title}</p>
        <p className="text-xs text-muted-foreground">{row.modules} modules</p>
      </div>
    ),
  },
  { key: "grade", header: "Grade", render: (row) => <Badge variant="secondary" className="rounded-full">{row.grade}</Badge> },
  { key: "subject", header: "Subject", render: (row) => row.subject },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "updatedAt", header: "Last updated", render: (row) => <span className="text-sm text-muted-foreground">{row.updatedAt}</span> },
  { key: "version", header: "Version", render: (row) => <Badge variant="outline" className="rounded-full font-mono text-[11px]">{row.version}</Badge> },
  {
    key: "actions",
    header: "Actions",
    className: "text-right",
    render: (row) => (
      <div className="flex justify-end">
        <RowActions
          label={row.title}
          actions={[
            { label: "Edit", icon: Pencil },
            { label: "Duplicate", icon: Copy },
            { label: "Preview", icon: Eye },
            { label: "Publish", icon: Send, separatorBefore: true },
            { label: "Archive", icon: Archive, destructive: true },
          ]}
        />
      </div>
    ),
  },
];

function ChapterManager() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Chapter manager"
      description="Every chapter you own, with status, version history and publishing controls."
      showNotice={false}
      actions={
        <Button
          className="rounded-2xl"
          onClick={() => toast("Create chapter", { description: "Opens the content editor in a later phase." })}
        >
          <Plus className="size-4" /> Create chapter
        </Button>
      }
    >
      <StudioToolbar
        searchPlaceholder="Search chapters…"
        filters={[
          { id: "grade", label: "Grade", options: ["Grade 9", "Grade 10", "Grade 12"] },
          { id: "subject", label: "Subject", options: ["Mathematics", "Science"] },
          { id: "status", label: "Status", options: ["Published", "Draft", "In review", "Archived"] },
        ]}
      />
      <DataTable columns={columns} rows={studioChapters} caption="Chapter manager" />
    </PortalPage>
  );
}
