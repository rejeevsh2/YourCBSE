import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/student/settings")({
  head: () => ({
    meta: [
      { title: "Settings — YourCBSE" },
      { name: "description", content: "Manage notifications and study preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentSettingsPage,
});

const toggles = [
  { id: "notify-email", label: "Email notifications", hint: "New chapters and resources" },
  { id: "notify-reminders", label: "Study reminders", hint: "A nudge if you miss a day" },
  { id: "notify-downloads", label: "Auto-download notes", hint: "Save new notes for offline use" },
  { id: "notify-digest", label: "Weekly progress digest", hint: "A summary every Sunday" },
];

function StudentSettingsPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Settings"
      description="Control notifications and how your study data behaves."
    >
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {toggles.map((toggle, index) => (
            <div key={toggle.id}>
              <div className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Label htmlFor={toggle.id}>{toggle.label}</Label>
                  <p className="text-xs text-muted-foreground">{toggle.hint}</p>
                </div>
                <Switch id={toggle.id} defaultChecked={index < 2} />
              </div>
              {index < toggles.length - 1 ? <Separator /> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
