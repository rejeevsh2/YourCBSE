import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Website Settings — YourCBSE Admin" },
      { name: "description", content: "Configure site identity, SEO and feature flags." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettingsPage,
});

const flags = [
  { id: "flag-registration", label: "Open registration", hint: "Allow new sign-ups" },
  { id: "flag-comments", label: "Chapter comments", hint: "Let students ask questions" },
  { id: "flag-maintenance", label: "Maintenance mode", hint: "Show a holding page" },
];

function AdminSettingsPage() {
  return (
    <PortalPage
      portalLabel="Admin Portal"
      portalPath="/admin"
      title="Website Settings"
      description="Site identity, SEO defaults and feature toggles."
    >
      <Card>
        <CardHeader>
          <CardTitle>Site identity</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="site-name">Website name</Label>
                <Input id="site-name" defaultValue="YourCBSE" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-domain">Domain</Label>
                <Input id="site-domain" defaultValue="yourcbse.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-tagline">Tagline</Label>
              <Input id="site-tagline" defaultValue="Everything You Need to Succeed in CBSE." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-meta">Default meta description</Label>
              <Textarea
                id="site-meta"
                rows={3}
                defaultValue="Chapter-wise CBSE notes, video lessons, worksheets and interactive practice for Classes 6 to 12."
              />
            </div>
            <Button type="submit" className="w-fit">
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {flags.map((flag, index) => (
            <div key={flag.id}>
              <div className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Label htmlFor={flag.id}>{flag.label}</Label>
                  <p className="text-xs text-muted-foreground">{flag.hint}</p>
                </div>
                <Switch id={flag.id} defaultChecked={index === 0} />
              </div>
              {index < flags.length - 1 ? <Separator /> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
