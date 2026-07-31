import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  Boxes,
  Eye,
  FileCode2,
  Github,
  History,
  RefreshCw,
  Send,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appVersionHistory, studioApps } from "@/data/teacher";

export const Route = createFileRoute("/teacher/interactive-apps")({
  head: () => ({
    meta: [
      { title: "Interactive App Manager — Teacher Studio" },
      { name: "description", content: "Upload, version and publish interactive chapter apps." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InteractiveAppManager,
});

const sourceIcon = {
  "ZIP upload": Upload,
  "HTML upload": FileCode2,
  GitHub: Github,
} as const;

function notify(action: string, target: string) {
  toast(`${action}: ${target}`, { description: "Connects to the Laravel backend in a later phase." });
}

function InteractiveAppManager() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Interactive apps"
      description="The heart of the studio — manage the HTML/React apps that power each chapter."
      showNotice={false}
      actions={
        <>
          <Button variant="outline" className="rounded-2xl" onClick={() => notify("Upload HTML", "New app")}>
            <FileCode2 className="size-4" /> Upload HTML
          </Button>
          <Button className="rounded-2xl" onClick={() => notify("Upload ZIP", "New app")}>
            <Upload className="size-4" /> Upload ZIP
          </Button>
        </>
      }
    >
      <StudioToolbar
        searchPlaceholder="Search interactive apps…"
        filters={[
          { id: "grade", label: "Grade", options: ["Grade 9", "Grade 10", "Grade 12"] },
          { id: "subject", label: "Subject", options: ["Mathematics", "Science"] },
          { id: "status", label: "Status", options: ["Published", "Draft", "In review", "Archived"] },
        ]}
        actions={
          <Button variant="outline" className="rounded-2xl" onClick={() => notify("Connect", "GitHub source")}>
            <Github className="size-4" /> GitHub source
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {studioApps.map((app) => {
          const SourceIcon = sourceIcon[app.source];
          return (
            <article key={app.id} className="tile tile-interactive flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Boxes className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading truncate text-sm font-bold">{app.name}</h3>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {app.grade} · {app.subject}
                  </p>
                </div>
                <RowActions
                  label={app.name}
                  actions={[
                    { label: "Preview", icon: Eye },
                    { label: "Replace current version", icon: RefreshCw },
                    { label: "Version history", icon: History },
                    { label: "Publish", icon: Send, separatorBefore: true },
                    { label: "Archive", icon: Archive, destructive: true },
                  ]}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={app.status} />
                <Badge variant="outline" className="rounded-full font-mono text-[11px]">
                  {app.version}
                </Badge>
                <Badge variant="secondary" className="rounded-full text-[11px]">
                  {app.sizeLabel}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                Chapter: <span className="font-medium text-foreground">{app.chapter}</span>
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <SourceIcon className="size-3.5" aria-hidden="true" /> {app.source} · {app.updatedAt}
              </p>

              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" className="rounded-2xl" onClick={() => notify("Preview", app.name)}>
                  <Eye className="size-4" /> Preview
                </Button>
                <Button size="sm" variant="ghost" className="rounded-2xl" onClick={() => notify("Publish", app.name)}>
                  <Send className="size-4" /> Publish
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Version history" icon={History}>
          <ol className="space-y-3">
            {appVersionHistory.map((entry) => (
              <li key={entry.id} className="flex gap-3 rounded-2xl border border-border/60 p-3">
                <Badge variant="outline" className="h-fit rounded-full font-mono text-[11px]">
                  {entry.version}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm">{entry.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.author} · {entry.at}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </StudioPanel>

        <StudioPanel title="Publish a new build" icon={Upload}>
          <div className="tile flex flex-col items-center gap-3 border-dashed p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Upload className="size-5" />
            </span>
            <p className="font-heading text-sm font-bold">Drop a ZIP or index.html bundle</p>
            <p className="text-xs text-muted-foreground">
              Builds are validated and versioned once the backend is connected.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={() => notify("Upload ZIP", "New build")}>
                Upload ZIP
              </Button>
              <Button variant="ghost" className="rounded-2xl" onClick={() => notify("Replace", "Current version")}>
                <RefreshCw className="size-4" /> Replace current
              </Button>
            </div>
          </div>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
