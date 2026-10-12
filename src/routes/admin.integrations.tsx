import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plug,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/integrations")({
  head: () => ({
    meta: [
      {
        title: "Integrations — YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Connected services powering video, email, storage and analytics.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminIntegrationsPage,
});

type Integration = {
  id: number;
  slug: string;
  name: string;
  category: string;
  provider: string | null;
  description: string | null;
  is_enabled: boolean;
  connection_status:
    | "not_configured"
    | "configured"
    | "connected"
    | "failed"
    | string;
  settings: Record<string, unknown>;
  has_credentials: boolean;
  credential_keys: string[];
  last_test_status: string | null;
  last_test_message: string | null;
  last_tested_at: string | null;
  connected_at: string | null;
  updated_by: {
    id: number;
    name: string;
    email: string;
  } | null;
  updated_at: string | null;
};

type IntegrationResponse = {
  integrations?: Integration[];
  integration?: Integration;
  message?: string;
};

type FieldDefinition = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "number";
  secret?: boolean;
};

type IntegrationDefinition = {
  providers: {
    value: string;
    label: string;
  }[];
  settings: FieldDefinition[];
  credentials: FieldDefinition[];
};

const definitions: Record<string, IntegrationDefinition> = {
  youtube: {
    providers: [
      {
        value: "youtube",
        label: "YouTube",
      },
    ],
    settings: [
      {
        key: "channel_id",
        label: "Channel ID",
        placeholder: "Optional YouTube channel ID",
      },
    ],
    credentials: [
      {
        key: "api_key",
        label: "YouTube API key",
        placeholder: "Enter API key",
        type: "password",
        secret: true,
      },
    ],
  },

  cloud_storage: {
    providers: [
      {
        value: "s3",
        label: "Amazon S3 / S3 compatible",
      },
    ],
    settings: [
      {
        key: "region",
        label: "Region",
        placeholder: "ap-south-1",
      },
      {
        key: "bucket",
        label: "Bucket",
        placeholder: "yourschool-media",
      },
      {
        key: "endpoint",
        label: "Custom endpoint",
        placeholder: "Optional S3-compatible endpoint",
      },
    ],
    credentials: [
      {
        key: "access_key_id",
        label: "Access key ID",
        type: "password",
        secret: true,
      },
      {
        key: "secret_access_key",
        label: "Secret access key",
        type: "password",
        secret: true,
      },
    ],
  },

  mailer: {
    providers: [
      {
        value: "smtp",
        label: "SMTP",
      },
      {
        value: "resend",
        label: "Resend",
      },
      {
        value: "postmark",
        label: "Postmark",
      },
      {
        value: "ses",
        label: "Amazon SES",
      },
    ],
    settings: [
      {
        key: "host",
        label: "Host",
        placeholder: "smtp.example.com",
      },
      {
        key: "port",
        label: "Port",
        placeholder: "587",
        type: "number",
      },
      {
        key: "username",
        label: "Username",
      },
      {
        key: "from_address",
        label: "From address",
        placeholder: "hello@yourschool.co.in",
      },
      {
        key: "from_name",
        label: "From name",
        placeholder: "YourSchool",
      },
    ],
    credentials: [
      {
        key: "password",
        label: "SMTP password / API token",
        type: "password",
        secret: true,
      },
      {
        key: "api_key",
        label: "Provider API key",
        type: "password",
        secret: true,
      },
    ],
  },

  analytics: {
    providers: [
      {
        value: "google_analytics",
        label: "Google Analytics",
      },
    ],
    settings: [
      {
        key: "measurement_id",
        label: "Measurement ID",
        placeholder: "G-XXXXXXXXXX",
      },
    ],
    credentials: [],
  },

  payment_gateway: {
    providers: [
      {
        value: "razorpay",
        label: "Razorpay",
      },
      {
        value: "stripe",
        label: "Stripe",
      },
    ],
    settings: [
      {
        key: "currency",
        label: "Default currency",
        placeholder: "INR",
      },
    ],
    credentials: [
      {
        key: "key_id",
        label: "Key ID",
        type: "password",
        secret: true,
      },
      {
        key: "key_secret",
        label: "Key secret",
        type: "password",
        secret: true,
      },
    ],
  },

  push_notifications: {
    providers: [
      {
        value: "firebase",
        label: "Firebase Cloud Messaging",
      },
    ],
    settings: [
      {
        key: "project_id",
        label: "Firebase project ID",
      },
      {
        key: "sender_id",
        label: "Sender ID",
      },
    ],
    credentials: [
      {
        key: "server_key",
        label: "Server key / service credential",
        type: "password",
        secret: true,
      },
    ],
  },
};

function statusLabel(status: string) {
  switch (status) {
    case "connected":
      return "Connected";
    case "configured":
      return "Configured";
    case "failed":
      return "Failed";
    default:
      return "Not configured";
  }
}

function statusTone(
  status: string,
): "success" | "warning" | "destructive" | "muted" {
  switch (status) {
    case "connected":
      return "success";
    case "configured":
      return "warning";
    case "failed":
      return "destructive";
    default:
      return "muted";
  }
}

function textValue(
  value: unknown,
): string {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return "";
}

function AdminIntegrationsPage() {
  const [integrations, setIntegrations] =
    useState<Integration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [provider, setProvider] =
    useState("");

  const [settings, setSettings] =
    useState<Record<string, string>>({});

  const [credentials, setCredentials] =
    useState<Record<string, string>>({});

  const selectedIntegration = useMemo(
    () =>
      integrations.find(
        (integration) =>
          integration.id === selectedId,
      ) ?? null,
    [integrations, selectedId],
  );

  const definition = selectedIntegration
    ? definitions[selectedIntegration.slug]
    : undefined;

  async function loadIntegrations() {
    setLoading(true);

    try {
      const result = await apiRequest(
        "/admin/integrations",
        {
          method: "GET",
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not load integrations.",
        );
      }

      const data =
        (result.data ?? {}) as IntegrationResponse;

      setIntegrations(
        data.integrations ?? [],
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not load integrations.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIntegrations();
  }, []);

  function openManager(
    integration: Integration,
  ) {
    if (selectedId === integration.id) {
      setSelectedId(null);
      return;
    }

    setSelectedId(integration.id);
    setProvider(
      integration.provider ?? "",
    );

    const nextSettings: Record<
      string,
      string
    > = {};

    for (
      const [key, value]
      of Object.entries(
        integration.settings ?? {},
      )
    ) {
      nextSettings[key] =
        textValue(value);
    }

    setSettings(nextSettings);
    setCredentials({});
  }

  async function saveIntegration() {
    if (!selectedIntegration) {
      return;
    }

    const cleanSettings =
      Object.fromEntries(
        Object.entries(settings).filter(
          ([, value]) =>
            value.trim() !== "",
        ),
      );

    const cleanCredentials =
      Object.fromEntries(
        Object.entries(credentials).filter(
          ([, value]) =>
            value.trim() !== "",
        ),
      );

    setBusy(true);

    try {
      const result = await apiRequest(
        `/admin/integrations/${selectedIntegration.id}`,
        {
          method: "PATCH",
          body: {
            provider:
              provider || null,
            settings: cleanSettings,
            credentials:
              cleanCredentials,
          },
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not save integration.",
        );
      }

      toast.success(
        result.message ||
          "Integration settings saved.",
      );

      setCredentials({});
      await loadIntegrations();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not save integration.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function testIntegration(
    integration: Integration,
  ) {
    if (
      integration.connection_status ===
      "not_configured"
    ) {
      toast.error(
        "Save the integration configuration before testing it.",
      );
      return;
    }

    setBusy(true);

    try {
      const result = await apiRequest(
        `/admin/integrations/${integration.id}/test`,
        {
          method: "POST",
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Connection test failed.",
        );
      }

      toast.success(
        result.message ||
          "Connection test passed.",
      );

      await loadIntegrations();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Connection test failed.",
      );

      await loadIntegrations();
    } finally {
      setBusy(false);
    }
  }

  async function toggleIntegration(
    integration: Integration,
  ) {
    if (
      !integration.is_enabled &&
      integration.last_test_status !==
        "success"
    ) {
      toast.error(
        "Test this integration successfully before enabling it.",
      );
      return;
    }

    setBusy(true);

    try {
      const result = await apiRequest(
        `/admin/integrations/${integration.id}/toggle`,
        {
          method: "PATCH",
          body: {
            is_enabled:
              !integration.is_enabled,
          },
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not update integration.",
        );
      }

      toast.success(
        result.message ||
          "Integration updated.",
      );

      await loadIntegrations();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update integration.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Integrations"
      description="Configure external services connected to YourSchool."
      showNotice={false}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Credentials are stored encrypted and
          are never returned by the API.
        </p>

        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() =>
            void loadIntegrations()
          }
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="tile p-6 text-sm text-muted-foreground">
          Loading integrations...
        </div>
      ) : integrations.length === 0 ? (
        <div className="tile p-6 text-sm text-muted-foreground">
          No integrations found.
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {integrations.map(
              (integration) => {
                const expanded =
                  selectedId ===
                  integration.id;

                return (
                  <li
                    key={integration.id}
                    className="tile space-y-4 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                        <Plug className="size-5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading truncate text-sm font-bold">
                          {integration.name}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <TonedBadge
                        label={statusLabel(
                          integration.connection_status,
                        )}
                        tone={statusTone(
                          integration.connection_status,
                        )}
                        dot
                      />

                      <TonedBadge
                        label={
                          integration.is_enabled
                            ? "Enabled"
                            : "Disabled"
                        }
                        tone={
                          integration.is_enabled
                            ? "success"
                            : "muted"
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          openManager(
                            integration,
                          )
                        }
                      >
                        {expanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}

                        {expanded
                          ? "Close"
                          : integration.connection_status ===
                              "not_configured"
                            ? "Configure"
                            : "Manage"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        className="ml-auto"
                        variant={
                          integration.is_enabled
                            ? "outline"
                            : "default"
                        }
                        disabled={busy}
                        onClick={() =>
                          void toggleIntegration(
                            integration,
                          )
                        }
                      >
                        {integration.is_enabled
                          ? "Disable"
                          : "Enable"}
                      </Button>
                    </div>
                  </li>
                );
              },
            )}
          </ul>

          {selectedIntegration ? (
            <section className="tile p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />

                    <h2 className="font-heading text-lg font-bold">
                      Manage{" "}
                      {selectedIntegration.name}
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Provider:{" "}
                    {selectedIntegration.provider ??
                      "Not selected"}
                  </p>
                </div>

                {selectedIntegration.has_credentials ? (
                  <TonedBadge
                    label="Credentials stored"
                    tone="success"
                    dot
                  />
                ) : (
                  <TonedBadge
                    label="No credentials stored"
                    tone="muted"
                  />
                )}
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Provider
                    </label>

                    <select
                      value={provider}
                      onChange={(event) =>
                        setProvider(
                          event.target.value,
                        )
                      }
                      className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {(definition?.providers ??
                        []).map(
                        (item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  {definition?.settings.map(
                    (field) => (
                      <div key={field.key}>
                        <label className="text-sm font-medium">
                          {field.label}
                        </label>

                        <input
                          type={
                            field.type ??
                            "text"
                          }
                          value={
                            settings[
                              field.key
                            ] ?? ""
                          }
                          placeholder={
                            field.placeholder
                          }
                          onChange={(
                            event,
                          ) =>
                            setSettings(
                              (current) => ({
                                ...current,
                                [field.key]:
                                  event.target
                                    .value,
                              }),
                            )
                          }
                          className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                        />
                      </div>
                    ),
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Credentials
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Existing secret values are
                      never displayed. Leave a
                      secret field blank to keep
                      its current value.
                    </p>
                  </div>

                  {definition?.credentials
                    .length ? (
                    definition.credentials.map(
                      (field) => (
                        <div key={field.key}>
                          <label className="text-sm font-medium">
                            {field.label}
                          </label>

                          <input
                            type={
                              field.type ??
                              "password"
                            }
                            value={
                              credentials[
                                field.key
                              ] ?? ""
                            }
                            placeholder={
                              selectedIntegration
                                .credential_keys
                                .includes(
                                  field.key,
                                )
                                ? "Stored securely — enter a new value only to replace"
                                : field.placeholder
                            }
                            onChange={(
                              event,
                            ) =>
                              setCredentials(
                                (
                                  current,
                                ) => ({
                                  ...current,
                                  [field.key]:
                                    event.target
                                      .value,
                                }),
                              )
                            }
                            autoComplete="new-password"
                            className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                          />
                        </div>
                      ),
                    )
                  ) : (
                    <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                      This integration does not
                      currently require a stored
                      secret.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void saveIntegration()
                  }
                >
                  <Save className="size-4" />
                  Save configuration
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    busy ||
                    selectedIntegration.connection_status ===
                      "not_configured"
                  }
                  onClick={() =>
                    void testIntegration(
                      selectedIntegration,
                    )
                  }
                >
                  <Plug className="size-4" />
                  Test connection
                </Button>

                {selectedIntegration.connection_status !==
                "not_configured" ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4" />
                    Configuration saved
                  </div>
                ) : null}
              </div>

              {selectedIntegration.last_test_status ? (
                <div className="mt-4 rounded-xl border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <TonedBadge
                      label={
                        selectedIntegration.last_test_status ===
                        "success"
                          ? "Test passed"
                          : "Test failed"
                      }
                      tone={
                        selectedIntegration.last_test_status ===
                        "success"
                          ? "success"
                          : "destructive"
                      }
                      dot
                    />

                    {selectedIntegration.last_tested_at ? (
                      <span className="text-xs text-muted-foreground">
                        Tested{" "}
                        {new Date(
                          selectedIntegration.last_tested_at,
                        ).toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  {selectedIntegration.last_test_message ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {
                        selectedIntegration.last_test_message
                      }
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      )}
    </PortalPage>
  );
}