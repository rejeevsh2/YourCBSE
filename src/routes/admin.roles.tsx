import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, ShieldCheck, X } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { TonedBadge } from "@/components/admin/AdminBadges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminRoles,
  permissionMatrix,
  permissionModules,
  permissionRoles,
} from "@/data/admin";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — YourCBSE Admin" },
      { name: "description", content: "Define roles and the permission matrix for each module." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRolesPage,
});

function AdminRolesPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Roles & Permissions"
      description="Who can access what, across every module of the platform."
      actions={
        <Button className="rounded-2xl">
          <Plus className="size-4" /> New role
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminRoles.map((role) => (
          <article key={role.id} className="tile tile-interactive space-y-3 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-heading truncate text-sm font-bold">{role.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {role.members.toLocaleString()} members
                </p>
              </div>
              <TonedBadge label={role.tone === "destructive" ? "Critical" : "Standard"} tone={role.tone} />
            </div>
            <p className="text-sm text-muted-foreground">{role.scope}</p>
            <Button variant="outline" size="sm" className="rounded-2xl">
              Edit permissions
            </Button>
          </article>
        ))}
      </div>

      <StudioPanel title="Permission matrix" icon={ShieldCheck}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-40">Module</TableHead>
                {permissionRoles.map((role) => (
                  <TableHead key={role} className="text-center">
                    {role}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionModules.map((module) => (
                <TableRow key={module}>
                  <TableCell className="font-medium">{module}</TableCell>
                  {permissionMatrix[module].map((allowed, index) => (
                    <TableCell key={permissionRoles[index]} className="text-center">
                      {allowed ? (
                        <Check
                          className="mx-auto size-4 text-success"
                          aria-label={`${permissionRoles[index]} allowed`}
                        />
                      ) : (
                        <X
                          className="mx-auto size-4 text-muted-foreground"
                          aria-label={`${permissionRoles[index]} denied`}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </StudioPanel>
    </PortalPage>
  );
}
