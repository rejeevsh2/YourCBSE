import { createFileRoute } from "@tanstack/react-router";
import { UploadCloud } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { latestResources } from "@/data/placeholder";
import type { ResourceItem } from "@/types";

export const Route = createFileRoute("/teacher/resources")({
  head: () => ({
    meta: [
      { title: "Upload Resources — YourCBSE Teacher" },
      { name: "description", content: "Publish notes, worksheets and sample papers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeacherResourcesPage,
});

const columns: Column<ResourceItem>[] = [
  { key: "title", header: "Resource", render: (row) => row.title },
  { key: "type", header: "Type", render: (row) => <Badge variant="secondary">{row.type}</Badge> },
  { key: "grade", header: "Grade", render: (row) => row.grade },
  { key: "size", header: "Size", render: (row) => row.sizeLabel },
];

function TeacherResourcesPage() {
  return (
    <PortalPage
      portalLabel="Teacher Portal"
      portalPath="/teacher"
      title="Upload Resources"
      description="Attach notes, worksheets and sample papers to your chapters."
    >
      <Card>
        <CardHeader>
          <CardTitle>New resource</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="resource-title">Title</Label>
                <Input id="resource-title" placeholder="e.g. Chapter 3 Notes" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-type">Type</Label>
                <Select>
                  <SelectTrigger id="resource-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">PDF Notes</SelectItem>
                    <SelectItem value="worksheet">Worksheet</SelectItem>
                    <SelectItem value="paper">Sample Paper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card p-10 text-center">
              <UploadCloud className="size-7 text-muted-foreground" />
              <p className="text-sm font-medium">Drop files here</p>
              <p className="text-xs text-muted-foreground">PDF or DOCX, up to 10 MB</p>
            </div>
            <Button type="submit" className="w-fit">
              Upload resource
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Recent uploads</h2>
        <DataTable columns={columns} rows={latestResources} caption="Recent uploads" />
      </section>
    </PortalPage>
  );
}
