import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Send, Trash2 } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { studioChapters, studioResources } from "@/data/teacher";

export const Route = createFileRoute("/teacher/drafts")({
  head: () => ({
    meta: [
      { title: "Drafts — Teacher Studio" },
      { name: "description", content: "Unpublished content waiting for review." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DraftsPage,
});

function DraftsPage() {
  const drafts = [
    ...studioChapters
      .filter((c) => c.status === "Draft" || c.status === "In review")
      .map((c) => ({ id: c.id, title: c.title, meta: `${c.grade} · ${c.subject}`, type: "Chapter", status: c.status, updatedAt: c.updatedAt })),
    ...studioResources
      .filter((r) => r.status === "Draft" || r.status === "In review")
      .map((r) => ({ id: r.id, title: r.title, meta: `${r.grade} · ${r.subject}`, type: r.kind, status: r.status, updatedAt: r.updatedAt })),
  ];

  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Drafts"
      description="Everything that is not live yet, across chapters and resources."
      showNotice={false}
    >
      <StudioToolbar
        searchPlaceholder="Search drafts…"
        filters={[{ id: "type", label: "Type", options: ["Chapter", "Video", "Worksheet", "Mind Map"] }]}
      />

      {drafts.length === 0 ? (
        <EmptyState title="No drafts" description="Everything you own is published." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {drafts.map((item) => (
            <li key={`${item.type}-${item.id}`} className="tile tile-interactive flex items-start gap-3 p-5">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="font-heading truncate text-sm font-bold">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.meta} · updated {item.updatedAt}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full text-[11px]">{item.type}</Badge>
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <RowActions
                label={item.title}
                actions={[
                  { label: "Continue editing", icon: Pencil },
                  { label: "Publish", icon: Send },
                  { label: "Discard draft", icon: Trash2, destructive: true, separatorBefore: true },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </PortalPage>
  );
}
