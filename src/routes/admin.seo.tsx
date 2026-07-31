import { createFileRoute } from "@tanstack/react-router";
import { Globe, RefreshCw, Search } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatCard } from "@/components/common/StatCard";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { TonedBadge } from "@/components/admin/AdminBadges";

export const Route = createFileRoute("/admin/seo")({
  head: () => ({
    meta: [
      { title: "SEO Manager — YourCBSE Admin" },
      { name: "description", content: "Global metadata, sitemap and indexing controls." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSeoPage,
});

const pages = [
  { id: "p1", path: "/", title: "YourCBSE — CBSE learning, made interactive", score: 96, indexed: true },
  { id: "p2", path: "/grades", title: "Browse all CBSE grades", score: 92, indexed: true },
  { id: "p3", path: "/subjects", title: "CBSE subjects and chapters", score: 88, indexed: true },
  { id: "p4", path: "/practice", title: "Practice tests and question banks", score: 74, indexed: true },
  { id: "p5", path: "/resources", title: "Notes, worksheets and mind maps", score: 68, indexed: false },
];

function AdminSeoPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="SEO Manager"
      description="Global metadata defaults, sitemap health and per-page indexing."
      actions={
        <Button className="rounded-2xl">
          <RefreshCw className="size-4" /> Regenerate sitemap
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Indexed URLs" value="1,284" hint="Sitemap current" tone="success" />
        <StatCard label="Avg. SEO score" value="86" tone="primary" />
        <StatCard label="Missing meta" value="24" hint="Needs attention" tone="warning" />
        <StatCard label="Broken links" value="3" tone="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Global defaults" icon={Globe}>
          <div className="space-y-2">
            <Label htmlFor="seo-title">Default title</Label>
            <Input id="seo-title" defaultValue="YourCBSE — CBSE learning, made interactive" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-desc">Default description</Label>
            <Textarea
              id="seo-desc"
              rows={3}
              defaultValue="Interactive chapters, videos, notes and practice tests aligned to the CBSE curriculum for Classes 1–12."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Keywords</Label>
            <Input id="seo-keywords" defaultValue="CBSE, NCERT solutions, class 10, class 12, practice tests" />
          </div>
          <div className="flex items-center gap-4 pt-1">
            <div className="min-w-0 flex-1">
              <Label htmlFor="seo-index" className="text-sm font-medium">
                Allow search engine indexing
              </Label>
              <p className="text-xs text-muted-foreground">Turn off during maintenance windows.</p>
            </div>
            <Switch id="seo-index" defaultChecked />
          </div>
          <Button className="rounded-2xl">Save defaults</Button>
        </StudioPanel>

        <StudioPanel title="Page performance" icon={Search}>
          <ul className="space-y-3">
            {pages.map((page) => (
              <li key={page.id} className="tile flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{page.title}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{page.path}</p>
                </div>
                <TonedBadge
                  label={`${page.score}`}
                  tone={page.score >= 90 ? "success" : page.score >= 75 ? "warning" : "destructive"}
                />
                <TonedBadge
                  label={page.indexed ? "Indexed" : "Excluded"}
                  tone={page.indexed ? "primary" : "muted"}
                />
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
