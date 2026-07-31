import { createFileRoute } from "@tanstack/react-router";
import { Archive, Eye, RefreshCw } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { studioChapters, studioResources } from "@/data/teacher";

export const Route = createFileRoute("/teacher/published")({
  head: () => ({
    meta: [
      { title: "Published Content — Teacher Studio" },
      { name: "description", content: "Everything currently live for students." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublishedPage,
});

interface Row {
  id: string;
  title: string;
  type: string;
  meta: string;
  updatedAt: string;
}

const columns: Column<Row>[] = [
  { key: "title", header: "Content", render: (row) => <span className="font-semibold">{row.title}</span> },
  { key: "type", header: "Type", render: (row) => <Badge variant="secondary" className="rounded-full text-[11px]">{row.type}</Badge> },
  { key: "meta", header: "Placement", render: (row) => <span className="text-sm text-muted-foreground">{row.meta}</span> },
  { key: "status", header: "Status", render: () => <StatusBadge status="Published" /> },
  { key: "updatedAt", header: "Last updated", render: (row) => <span className="text-sm text-muted-foreground">{row.updatedAt}</span> },
  {
    key: "actions",
    header: "Actions",
    className: "text-right",
    render: (row) => (
      <div className="flex justify-end">
        <RowActions
          label={row.title}
          actions={[
            { label: "Preview", icon: Eye },
            { label: "Publish update", icon: RefreshCw },
            { label: "Archive", icon: Archive, destructive: true, separatorBefore: true },
          ]}
        />
      </div>
    ),
  },
];

function PublishedPage() {
  const rows: Row[] = [
    ...studioChapters
      .filter((c) => c.status === "Published")
      .map((c) => ({ id: `c-${c.id}`, title: c.title, type: "Chapter", meta: `${c.grade} · ${c.subject}`, updatedAt: c.updatedAt })),
    ...studioResources
      .filter((r) => r.status === "Published")
      .map((r) => ({ id: `r-${r.id}`, title: r.title, type: r.kind, meta: `${r.grade} · ${r.chapter}`, updatedAt: r.updatedAt })),
  ];

  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Published content"
      description="Live for students right now — review, update or archive."
      showNotice={false}
    >
      <StudioToolbar
        searchPlaceholder="Search published content…"
        filters={[
          { id: "type", label: "Type", options: ["Chapter", "Video", "PDF Notes", "Worksheet"] },
          { id: "grade", label: "Grade", options: ["Grade 9", "Grade 10", "Grade 12"] },
        ]}
      />
      <DataTable columns={columns} rows={rows} caption="Published content" />
    </PortalPage>
  );
}
