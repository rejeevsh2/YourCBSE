import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Save } from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      {
        title: "Website Settings - YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Configure site identity, SEO defaults and feature flags.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminSettingsPage,
});

type WebsiteSettings = {
  id: number;
  site_name: string;
  site_domain: string;
  tagline: string | null;
  default_meta_description: string | null;
  open_registration: boolean;
  chapter_comments: boolean;
  maintenance_mode: boolean;
};

type WebsiteSettingsResponse = {
  settings?: WebsiteSettings;
  message?: string;
};

const EMPTY_SETTINGS: WebsiteSettings = {
  id: 1,
  site_name: "YourSchool",
  site_domain: "yourschool.co.in",
  tagline: "",
  default_meta_description: "",
  open_registration: true,
  chapter_comments: false,
  maintenance_mode: false,
};

function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<WebsiteSettings>(EMPTY_SETTINGS);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  async function loadSettings() {
    setLoading(true);

    const result =
      await apiRequest<WebsiteSettingsResponse>(
        "/admin/website-settings",
        {
          method: "GET",
        },
      );

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to load website settings.",
      );
      setLoading(false);
      return;
    }

    const data =
      (result.data ??
        {}) as WebsiteSettingsResponse;

    if (data.settings) {
      setSettings(data.settings);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function saveSettings(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSaving(true);

    const result =
      await apiRequest<WebsiteSettingsResponse>(
        "/admin/website-settings",
        {
          method: "PATCH",
          body: {
            site_name:
              settings.site_name.trim(),
            site_domain:
              settings.site_domain.trim(),
            tagline:
              settings.tagline?.trim() || null,
            default_meta_description:
              settings.default_meta_description?.trim() ||
              null,
            open_registration:
              settings.open_registration,
            chapter_comments:
              settings.chapter_comments,
            maintenance_mode:
              settings.maintenance_mode,
          },
        },
      );

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to save website settings.",
      );
      setSaving(false);
      return;
    }

    const data =
      (result.data ??
        {}) as WebsiteSettingsResponse;

    if (data.settings) {
      setSettings(data.settings);
    }

    toast.success(
      data.message ??
        "Website settings saved.",
    );

    setSaving(false);
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Website Settings"
      description="Site identity, SEO defaults and platform feature controls."
      showNotice={false}
    >
      <form
        className="space-y-5"
        onSubmit={saveSettings}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Site identity
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5">
            {loading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading website settings...
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">
                      Website name
                    </Label>

                    <Input
                      id="site-name"
                      value={settings.site_name}
                      maxLength={120}
                      required
                      onChange={(event) =>
                        setSettings(
                          (current) => ({
                            ...current,
                            site_name:
                              event.target.value,
                          }),
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site-domain">
                      Domain
                    </Label>

                    <Input
                      id="site-domain"
                      value={settings.site_domain}
                      maxLength={255}
                      required
                      onChange={(event) =>
                        setSettings(
                          (current) => ({
                            ...current,
                            site_domain:
                              event.target.value,
                          }),
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-tagline">
                    Tagline
                  </Label>

                  <Input
                    id="site-tagline"
                    value={
                      settings.tagline ?? ""
                    }
                    maxLength={255}
                    onChange={(event) =>
                      setSettings(
                        (current) => ({
                          ...current,
                          tagline:
                            event.target.value,
                        }),
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-meta">
                    Default meta description
                  </Label>

                  <Textarea
                    id="site-meta"
                    rows={4}
                    maxLength={1000}
                    value={
                      settings.default_meta_description ??
                      ""
                    }
                    onChange={(event) =>
                      setSettings(
                        (current) => ({
                          ...current,
                          default_meta_description:
                            event.target.value,
                        }),
                      )
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Feature controls
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <Label htmlFor="open-registration">
                  Open registration
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow new public account registrations.
                </p>
              </div>

              <Switch
                id="open-registration"
                checked={
                  settings.open_registration
                }
                disabled={loading}
                onCheckedChange={(checked) =>
                  setSettings(
                    (current) => ({
                      ...current,
                      open_registration:
                        checked,
                    }),
                  )
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <Label htmlFor="chapter-comments">
                  Chapter comments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow chapter-level student questions and comments.
                </p>
              </div>

              <Switch
                id="chapter-comments"
                checked={
                  settings.chapter_comments
                }
                disabled={loading}
                onCheckedChange={(checked) =>
                  setSettings(
                    (current) => ({
                      ...current,
                      chapter_comments:
                        checked,
                    }),
                  )
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <Label htmlFor="maintenance-mode">
                  Maintenance mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Stores the maintenance preference. Site-wide enforcement can use this setting when enabled.
                </p>
              </div>

              <Switch
                id="maintenance-mode"
                checked={
                  settings.maintenance_mode
                }
                disabled={loading}
                onCheckedChange={(checked) =>
                  setSettings(
                    (current) => ({
                      ...current,
                      maintenance_mode:
                        checked,
                    }),
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={loading || saving}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {saving
            ? "Saving..."
            : "Save settings"}
        </Button>
      </form>
    </PortalPage>
  );
}