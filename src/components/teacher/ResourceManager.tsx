import { useMemo, type ReactNode } from "react";
import {
  Eye,
  FileAudio,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Layers3,
  Network,
  PlayCircle,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { StatusBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { studioResources, type ResourceKind, type StudioResource } from "@/data/teacher";
import { cn } from "@/lib/utils";

const kindIcon: Record<ResourceKind, React.ComponentType<{ className?: string }>> = {
  Video: PlayCircle,
  "PDF Notes": FileText,
  Worksheet: FileText,
  Flashcards: Layers3,
  "Mind Map": Network,
  Image: ImageIcon,
  Audio: FileAudio,
  Document: FolderOpen,
};

const kindTone: Record<ResourceKind, string> = {
  Video: "bg-primary/12 text-primary",
  "PDF Notes": "bg-success/12 text-success",
  Worksheet: "bg-warning/12 text-warning",
  Flashcards: "bg-primary/12 text-primary",
  "Mind Map": "bg-success/12 text-success",
  Image: "bg-warning/12 text-warning",
  Audio: "bg-primary/12 text-primary",
  Document: "bg-muted text-muted-foreground",
};

function notify(action: string, title: string) {
  toast(`${action}: ${title}`, {
    description: "Connects to the Laravel backend in a later phase.",
  });
}

export function ResourceCard({ resource }: { resource: StudioResource }) {
  const Icon = kindIcon[resource.kind];
  return (
    <article className="tile tile-interactive flex h-full flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            kindTone[resource.kind],
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading truncate text-sm font-bold">{resource.title}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {resource.grade} · {resource.subject}
          </p>
        </div>
        <RowActions
          label={resource.title}
          actions={[
            { label: "Preview", icon: Eye },
            { label: "Replace file", icon: RefreshCw },
            { label: "Delete", icon: Trash2, destructive: true, separatorBefore: true },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={resource.status} />
        <Badge variant="secondary" className="rounded-full text-[11px]">
          {resource.kind}
        </Badge>
        <Badge variant="outline" className="rounded-full text-[11px]">
          {resource.sizeLabel}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        {resource.chapter} · updated {resource.updatedAt}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="rounded-2xl"
          onClick={() => notify("Preview", resource.title)}
        >
          <Eye className="size-4" /> Preview
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-2xl"
          onClick={() => notify("Replace", resource.title)}
        >
          <RefreshCw className="size-4" /> Replace
        </Button>
      </div>
    </article>
  );
}

export function UploadDropzone({ label }: { label: string }) {
  return (
    <div className="tile flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Upload className="size-5" />
      </span>
      <div>
        <p className="font-heading text-sm font-bold">Upload {label}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag files here or browse. Storage is wired up during Laravel integration.
        </p>
      </div>
      <Button
        variant="outline"
        className="rounded-2xl"
        onClick={() => notify("Upload", label)}
      >
        Browse files
      </Button>
    </div>
  );
}

interface ResourceManagerProps {
  kinds: ResourceKind[];
  uploadLabel: string;
  searchPlaceholder?: string;
  children?: ReactNode;
}

/** Reusable manager used by Videos, Notes, Worksheets, Flashcards, Mind Maps and Library. */
export function ResourceManager({
  kinds,
  uploadLabel,
  searchPlaceholder = "Search resources…",
  children,
}: ResourceManagerProps) {
  const rows = useMemo(
    () => studioResources.filter((item) => kinds.includes(item.kind)),
    [kinds],
  );

  return (
    <>
      <StudioToolbar
        searchPlaceholder={searchPlaceholder}
        filters={[
          { id: "grade", label: "Grade", options: ["Grade 9", "Grade 10", "Grade 12"] },
          { id: "subject", label: "Subject", options: ["Mathematics", "Science", "Hindi"] },
          { id: "status", label: "Status", options: ["Published", "Draft", "In review", "Archived"] },
        ]}
        actions={
          <Button className="rounded-2xl" onClick={() => notify("Upload", uploadLabel)}>
            <Upload className="size-4" /> Upload
          </Button>
        }
      />

      {children}

      {rows.length === 0 ? (
        <EmptyState
          title={`No ${uploadLabel.toLowerCase()} yet`}
          description="Upload your first file to see it listed here."
          actionLabel="Upload file"
          onAction={() => notify("Upload", uploadLabel)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      <UploadDropzone label={uploadLabel} />
    </>
  );
}
