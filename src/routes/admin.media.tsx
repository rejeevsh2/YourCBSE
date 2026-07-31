import { createFileRoute } from "@tanstack/react-router";
import { Image as ImageIcon, Upload } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { Progress } from "@/components/ui/progress";
import { RowActions } from "@/components/teacher/RowActions";
import { adminMedia } from "@/data/admin";

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [
      { title: "Media Library — YourCBSE Admin" },
      { name: "description", content: "Images, video, audio and documents used across the platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminMediaPage,
});

const kindTone = {
  Image: "primary",
  Video: "success",
  PDF: "destructive",
  Audio: "warning",
  ZIP: "muted",
  Document: "muted",
} as const;

function AdminMediaPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Media Library"
      description="Every asset uploaded to YourCBSE, with usage and storage detail."
      actions={
        <Button className="rounded-2xl">
          <Upload className="size-4" /> Upload
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assets" value="12,486" tone="primary" />
        <StatCard label="Storage used" value="712 GB" hint="71% of 1 TB" tone="warning" />
        <StatCard label="Added this week" value="184" tone="success" />
        <StatCard label="Unused assets" value="326" hint="Safe to clean up" />
      </div>

      <div className="tile space-y-2 p-5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Storage quota</span>
          <span className="font-semibold">712 GB / 1 TB</span>
        </div>
        <Progress value={71} aria-label="Storage quota usage" />
      </div>

      <StudioToolbar
        searchPlaceholder="Search media…"
        filters={[
          { id: "kind", label: "Type", options: ["All types", "Image", "Video", "PDF", "Audio", "ZIP", "Document"] },
          { id: "usage", label: "Usage", options: ["All assets", "In use", "Unused"] },
        ]}
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminMedia.map((asset) => (
          <li key={asset.id} className="tile tile-interactive space-y-3 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <ImageIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{asset.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {asset.size} · {asset.uploadedBy}
                </p>
              </div>
              <RowActions
                label={asset.name}
                actions={[
                  { label: "Preview" },
                  { label: "Copy URL" },
                  { label: "Replace file" },
                  { label: "Delete", separatorBefore: true, destructive: true },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TonedBadge label={asset.kind} tone={kindTone[asset.kind]} />
              <span className="text-xs text-muted-foreground">{asset.uploadedAt}</span>
            </div>
          </li>
        ))}
      </ul>
    </PortalPage>
  );
}
