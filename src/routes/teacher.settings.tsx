import { createFileRoute } from "@tanstack/react-router";
import { Bell, Palette, ShieldCheck, UserCog } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { teacherProfile } from "@/data/teacher";

export const Route = createFileRoute("/teacher/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Teacher Studio" },
      { name: "description", content: "Studio preferences and notification controls." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const toggles = [
  { id: "n1", label: "New student submissions", hint: "Email me when work is handed in." },
  { id: "n2", label: "Content review requests", hint: "Notify me when a co-teacher requests review." },
  { id: "n3", label: "Weekly analytics digest", hint: "A Monday summary of content performance." },
];

function SettingsPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Settings"
      description="Studio preferences. Saving is enabled once the backend is connected."
      showNotice={false}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel title="Teaching profile" icon={UserCog}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={teacherProfile.name} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjects">Subjects</Label>
              <Input id="subjects" defaultValue={teacherProfile.role} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input id="school" defaultValue={teacherProfile.school} className="rounded-2xl" />
            </div>
            <Button className="rounded-2xl" disabled>
              Save changes
            </Button>
          </div>
        </StudioPanel>

        <StudioPanel title="Notifications" icon={Bell}>
          <ul className="space-y-4">
            {toggles.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={item.id} className="text-sm font-medium">
                    {item.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                </div>
                <Switch id={item.id} defaultChecked />
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Publishing defaults" icon={ShieldCheck}>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <Label htmlFor="p1" className="text-sm font-medium">Require review before publish</Label>
                <p className="text-xs text-muted-foreground">A co-teacher approves each new version.</p>
              </div>
              <Switch id="p1" defaultChecked />
            </li>
            <li className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <Label htmlFor="p2" className="text-sm font-medium">Auto-version uploads</Label>
                <p className="text-xs text-muted-foreground">Increment the app version on each new build.</p>
              </div>
              <Switch id="p2" defaultChecked />
            </li>
          </ul>
        </StudioPanel>

        <StudioPanel title="Appearance" icon={Palette}>
          <p className="text-sm text-muted-foreground">
            Theme follows your global preference — switch light, dark or system from the header toggle.
          </p>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
