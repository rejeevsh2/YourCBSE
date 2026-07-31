import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { UserTable } from "@/components/admin/UserTable";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { adminParents } from "@/data/admin";

export const Route = createFileRoute("/admin/parents")({
  head: () => ({
    meta: [
      { title: "Parents — YourCBSE Admin" },
      { name: "description", content: "Guardian accounts linked to student progress." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminParentsPage,
});

const roadmap = [
  "Link a guardian to one or more student accounts",
  "Read-only weekly progress digest by email",
  "Attendance and assignment visibility",
  "Teacher-to-parent messaging thread",
];

function AdminParentsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Parents"
      description="Guardian accounts — an upcoming module, previewed here."
    >
      <StudioPanel title="Planned capabilities" icon={HeartHandshake}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {roadmap.map((entry) => (
            <li key={entry} className="flex gap-2 text-sm text-muted-foreground">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {entry}
            </li>
          ))}
        </ul>
      </StudioPanel>

      <UserTable rows={adminParents} caption="Parent accounts" createLabel="Invite parent" />
    </PortalPage>
  );
}
