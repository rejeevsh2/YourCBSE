import { createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { TonedBadge } from "@/components/admin/AdminBadges";
import { StatCard } from "@/components/common/StatCard";
import {
  DataTable,
  type Column,
} from "@/components/common/DataTable";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/security")({
  head: () => ({
    meta: [
      {
        title: "Security - YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Security policies, alerts, login history and IP controls.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminSecurityPage,
});

type UserSummary = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

type SecurityStats = {
  open_alerts: number;
  failed_logins_24h: number;
  successful_logins_24h: number;
  blocked_ips: number;
  mfa_available: boolean;
};

type SecuritySettings = {
  id: number;
  failed_login_lockout_enabled: boolean;
  failed_login_max_attempts: number;
  failed_login_window_minutes: number;
  failed_login_lockout_minutes: number;
  admin_ip_restriction_enabled: boolean;
  allowed_admin_ips: string[];
  security_alerts_enabled: boolean;
  updated_at: string | null;
};

type SecurityAlert = {
  id: number;
  type: string;
  title: string;
  severity: string;
  detail: string | null;
  ip_address: string | null;
  user_id: number | null;
  login_event_id: number | null;
  metadata: Record<string, unknown> | null;
  status: string;
  resolved_at: string | null;
  resolved_by: UserSummary | number | null;
  created_at: string;
  updated_at: string;
  user: UserSummary | null;
};

type LoginEvent = {
  id: number;
  user_id: number | null;
  email: string;
  status: string;
  failure_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  user: UserSummary | null;
};

type LoginEventRow = Omit<LoginEvent, "id"> & {
  id: string;
};

type BlockedIp = {
  id: number;
  ip_address: string;
  source: string;
  reason: string | null;
  is_active: boolean;
  blocked_until: string | null;
  created_by: UserSummary | number | null;
  created_at: string;
  updated_at: string;
};

type SecurityResponse = {
  stats?: SecurityStats;
  settings?: SecuritySettings;
  alerts?: SecurityAlert[];
  login_events?: LoginEvent[];
  blocked_ips?: BlockedIp[];
  message?: string;
};

const EMPTY_STATS: SecurityStats = {
  open_alerts: 0,
  failed_logins_24h: 0,
  successful_logins_24h: 0,
  blocked_ips: 0,
  mfa_available: false,
};

function formatDateTime(
  value: string | null | undefined,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function capitalise(value: string): string {
  if (!value) {
    return "-";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).replaceAll("_", " ")
  );
}

function severityTone(
  severity: string,
):
  | "success"
  | "warning"
  | "destructive"
  | "primary"
  | "muted" {
  switch (severity.toLowerCase()) {
    case "high":
    case "critical":
      return "destructive";

    case "medium":
      return "warning";

    case "low":
      return "muted";

    default:
      return "primary";
  }
}

function deviceLabel(
  userAgent: string | null,
): string {
  if (!userAgent) {
    return "Unknown";
  }

  const ua = userAgent.toLowerCase();

  let browser = "Browser";

  if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome/")) {
    browser = "Chrome";
  } else if (ua.includes("firefox/")) {
    browser = "Firefox";
  } else if (ua.includes("safari/")) {
    browser = "Safari";
  } else if (ua.includes("powershell")) {
    browser = "PowerShell";
  } else if (ua.includes("curl")) {
    browser = "Curl";
  }

  let platform = "Unknown OS";

  if (ua.includes("windows")) {
    platform = "Windows";
  } else if (
    ua.includes("iphone") ||
    ua.includes("ipad")
  ) {
    platform = "iOS";
  } else if (ua.includes("android")) {
    platform = "Android";
  } else if (
    ua.includes("macintosh") ||
    ua.includes("mac os")
  ) {
    platform = "macOS";
  } else if (ua.includes("linux")) {
    platform = "Linux";
  }

  return `${browser} / ${platform}`;
}

const loginColumns: Column<LoginEventRow>[] = [
  {
    key: "user",
    header: "Account",
    render: (row) => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">
          {row.user?.name || row.email}
        </p>

        {row.user?.name ? (
          <p className="text-xs text-muted-foreground">
            {row.email}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    key: "status",
    header: "Result",
    render: (row) => (
      <div className="space-y-1">
        <TonedBadge
          label={capitalise(row.status)}
          tone={
            row.status === "success"
              ? "success"
              : "destructive"
          }
        />

        {row.failure_reason ? (
          <p className="text-xs text-muted-foreground">
            {capitalise(row.failure_reason)}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    key: "ip_address",
    header: "IP address",
    render: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.ip_address || "Unknown"}
      </span>
    ),
  },
  {
    key: "user_agent",
    header: "Device",
    render: (row) => (
      <span className="text-sm text-muted-foreground">
        {deviceLabel(row.user_agent)}
      </span>
    ),
  },
  {
    key: "occurred_at",
    header: "When",
    render: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(row.occurred_at)}
      </span>
    ),
  },
];

function AdminSecurityPage() {
  const [data, setData] =
    useState<SecurityResponse | null>(null);

  const [settings, setSettings] =
    useState<SecuritySettings | null>(null);

  const [allowedIpsText, setAllowedIpsText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [actionKey, setActionKey] =
    useState<string | null>(null);

  const [manualIp, setManualIp] =
    useState("");

  const [manualReason, setManualReason] =
    useState("");

  const stats = data?.stats ?? EMPTY_STATS;

  const alerts = useMemo(
    () => data?.alerts ?? [],
    [data?.alerts],
  );

  const blockedIps = useMemo(
    () => data?.blocked_ips ?? [],
    [data?.blocked_ips],
  );

  const loginEvents = useMemo(
    () => data?.login_events ?? [],
    [data?.login_events],
  );

  const loginRows = useMemo<LoginEventRow[]>(
    () =>
      loginEvents.map((event) => ({
        ...event,
        id: String(event.id),
      })),
    [loginEvents],
  );

  async function loadSecurity(): Promise<void> {
    setLoading(true);

    try {
      const result = await apiRequest(
        "/admin/security",
        {
          method: "GET",
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not load Security Center.",
        );
      }

      const payload =
        (result.data ?? {}) as SecurityResponse;

      setData(payload);

      if (payload.settings) {
        setSettings(payload.settings);

        setAllowedIpsText(
          (
            payload.settings.allowed_admin_ips ??
            []
          ).join("\n"),
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load Security Center.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSecurity();
  }, []);

  function updateSetting<K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K],
  ): void {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });
  }

  async function savePolicies(): Promise<void> {
    if (!settings) {
      return;
    }

    const allowedIps = allowedIpsText
      .split(/[,\s]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (
      settings.admin_ip_restriction_enabled &&
      allowedIps.length === 0
    ) {
      toast.error(
        "Add at least one allowed admin IP before enabling IP restriction.",
      );

      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest(
        "/admin/security/settings",
        {
          method: "PATCH",
          body: {
            failed_login_lockout_enabled:
              settings.failed_login_lockout_enabled,

            failed_login_max_attempts:
              settings.failed_login_max_attempts,

            failed_login_window_minutes:
              settings.failed_login_window_minutes,

            failed_login_lockout_minutes:
              settings.failed_login_lockout_minutes,

            admin_ip_restriction_enabled:
              settings.admin_ip_restriction_enabled,

            allowed_admin_ips: allowedIps,

            security_alerts_enabled:
              settings.security_alerts_enabled,
          },
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not save security policies.",
        );
      }

      toast.success(
        result.message ||
          "Security policies saved.",
      );

      await loadSecurity();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save security policies.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function resolveAlert(
    alert: SecurityAlert,
  ): Promise<void> {
    if (alert.status === "resolved") {
      return;
    }

    const key = `alert-${alert.id}`;

    setActionKey(key);

    try {
      const result = await apiRequest(
        `/admin/security/alerts/${alert.id}/resolve`,
        {
          method: "PATCH",
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not resolve security alert.",
        );
      }

      toast.success(
        result.message ||
          "Security alert resolved.",
      );

      await loadSecurity();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not resolve security alert.",
      );
    } finally {
      setActionKey(null);
    }
  }

  async function blockIpAddress(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const ip = manualIp.trim();

    if (!ip) {
      toast.error("Enter an IP address.");
      return;
    }

    setActionKey("block-ip");

    try {
      const result = await apiRequest(
        "/admin/security/blocked-ips",
        {
          method: "POST",
          body: {
            ip_address: ip,
            reason:
              manualReason.trim() || null,
          },
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not block IP address.",
        );
      }

      toast.success(
        result.message ||
          "IP address blocked.",
      );

      setManualIp("");
      setManualReason("");

      await loadSecurity();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not block IP address.",
      );
    } finally {
      setActionKey(null);
    }
  }

  async function unblockIp(
    block: BlockedIp,
  ): Promise<void> {
    const key = `unblock-${block.id}`;

    setActionKey(key);

    try {
      const result = await apiRequest(
        `/admin/security/blocked-ips/${block.id}/unblock`,
        {
          method: "PATCH",
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not unblock IP address.",
        );
      }

      toast.success(
        result.message ||
          "IP address unblocked.",
      );

      await loadSecurity();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not unblock IP address.",
      );
    } finally {
      setActionKey(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Security"
      description="Real authentication monitoring, access policies, alerts and IP protection."
      showNotice={false}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={loading}
            onClick={() => {
              void loadSecurity();
            }}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>

          <Button
            type="button"
            className="rounded-2xl"
            disabled={
              loading ||
              saving ||
              settings === null
            }
            onClick={() => {
              void savePolicies();
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving
              ? "Saving..."
              : "Save policies"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open alerts"
          value={loading ? "-" : String(stats.open_alerts)}
          tone={
            stats.open_alerts > 0
              ? "warning"
              : "success"
          }
        />

        <StatCard
          label="Failed logins (24h)"
          value={
            loading
              ? "-"
              : String(
                  stats.failed_logins_24h,
                )
          }
          tone={
            stats.failed_logins_24h > 0
              ? "destructive"
              : "success"
          }
        />

        <StatCard
          label="Successful logins (24h)"
          value={
            loading
              ? "-"
              : String(
                  stats.successful_logins_24h,
                )
          }
          tone="success"
        />

        <StatCard
          label="Blocked IPs"
          value={
            loading
              ? "-"
              : String(stats.blocked_ips)
          }
          tone={
            stats.blocked_ips > 0
              ? "warning"
              : "primary"
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <StudioPanel
          title="Access policies"
          icon={KeyRound}
        >
          {settings ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor="failed-login-lockout"
                    className="text-sm font-medium"
                  >
                    Failed-login protection
                  </Label>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Automatically block an IP after
                    repeated invalid login attempts.
                  </p>
                </div>

                <Switch
                  id="failed-login-lockout"
                  checked={
                    settings.failed_login_lockout_enabled
                  }
                  onCheckedChange={(checked) =>
                    updateSetting(
                      "failed_login_lockout_enabled",
                      checked,
                    )
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">
                    Max attempts
                  </Label>

                  <input
                    id="max-attempts"
                    type="number"
                    min={3}
                    max={20}
                    value={
                      settings.failed_login_max_attempts
                    }
                    onChange={(event) =>
                      updateSetting(
                        "failed_login_max_attempts",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attempt-window">
                    Window (minutes)
                  </Label>

                  <input
                    id="attempt-window"
                    type="number"
                    min={1}
                    max={1440}
                    value={
                      settings.failed_login_window_minutes
                    }
                    onChange={(event) =>
                      updateSetting(
                        "failed_login_window_minutes",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockout-minutes">
                    Block time (minutes)
                  </Label>

                  <input
                    id="lockout-minutes"
                    type="number"
                    min={1}
                    max={10080}
                    value={
                      settings.failed_login_lockout_minutes
                    }
                    onChange={(event) =>
                      updateSetting(
                        "failed_login_lockout_minutes",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="border-t pt-5">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <Label
                      htmlFor="security-alerts"
                      className="text-sm font-medium"
                    >
                      Security alerts
                    </Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Create actionable alerts for
                      detected security events.
                    </p>
                  </div>

                  <Switch
                    id="security-alerts"
                    checked={
                      settings.security_alerts_enabled
                    }
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "security_alerts_enabled",
                        checked,
                      )
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-5">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <Label
                      htmlFor="admin-ip-restriction"
                      className="text-sm font-medium"
                    >
                      Restrict admin access by IP
                    </Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Only listed IP addresses may
                      sign in to admin accounts.
                    </p>
                  </div>

                  <Switch
                    id="admin-ip-restriction"
                    checked={
                      settings.admin_ip_restriction_enabled
                    }
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "admin_ip_restriction_enabled",
                        checked,
                      )
                    }
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="allowed-admin-ips">
                    Allowed admin IP addresses
                  </Label>

                  <textarea
                    id="allowed-admin-ips"
                    rows={4}
                    value={allowedIpsText}
                    onChange={(event) =>
                      setAllowedIpsText(
                        event.target.value,
                      )
                    }
                    placeholder={
                      "127.0.0.1\n192.0.2.10"
                    }
                    className="w-full resize-y rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />

                  <p className="text-xs text-muted-foreground">
                    Enter one IP per line or separate
                    addresses with commas. Your current
                    IP must be included before this
                    restriction can be enabled.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="text-sm font-medium">
                      MFA status
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Multi-factor authentication is
                      not yet implemented. Security
                      Center intentionally does not
                      report a fabricated MFA adoption
                      percentage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Loading security policies..."
                : "Security policies are unavailable."}
            </p>
          )}
        </StudioPanel>

        <StudioPanel
          title="Security alerts"
          icon={ShieldAlert}
        >
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <CheckCircle2 className="mx-auto h-7 w-7 text-muted-foreground" />

              <p className="mt-2 text-sm font-medium">
                No security alerts
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                New detected security events will
                appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="tile space-y-3 p-4"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {alert.title}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <TonedBadge
                          label={capitalise(
                            alert.severity,
                          )}
                          tone={severityTone(
                            alert.severity,
                          )}
                        />

                        <TonedBadge
                          label={capitalise(
                            alert.status,
                          )}
                          tone={
                            alert.status ===
                            "resolved"
                              ? "success"
                              : "warning"
                          }
                        />
                      </div>
                    </div>

                    {alert.status === "open" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        disabled={
                          actionKey ===
                          `alert-${alert.id}`
                        }
                        onClick={() => {
                          void resolveAlert(alert);
                        }}
                      >
                        {actionKey ===
                        `alert-${alert.id}`
                          ? "Resolving..."
                          : "Resolve"}
                      </Button>
                    ) : null}
                  </div>

                  {alert.detail ? (
                    <p className="text-sm text-muted-foreground">
                      {alert.detail}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {alert.ip_address ? (
                      <span>
                        IP: {alert.ip_address}
                      </span>
                    ) : null}

                    {alert.user?.email ? (
                      <span>
                        Account:{" "}
                        {alert.user.email}
                      </span>
                    ) : null}

                    <span>
                      {formatDateTime(
                        alert.created_at,
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>

      <StudioPanel
        title="Blocked IP addresses"
        icon={Ban}
      >
        <form
          onSubmit={(event) => {
            void blockIpAddress(event);
          }}
          className="grid gap-3 rounded-xl border p-4 lg:grid-cols-[220px_1fr_auto]"
        >
          <div className="space-y-2">
            <Label htmlFor="manual-block-ip">
              IP address
            </Label>

            <input
              id="manual-block-ip"
              type="text"
              value={manualIp}
              onChange={(event) =>
                setManualIp(event.target.value)
              }
              placeholder="198.51.100.25"
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-block-reason">
              Reason
            </Label>

            <input
              id="manual-block-reason"
              type="text"
              value={manualReason}
              onChange={(event) =>
                setManualReason(
                  event.target.value,
                )
              }
              placeholder="Optional administrative reason"
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full rounded-xl lg:w-auto"
              disabled={
                actionKey === "block-ip"
              }
            >
              {actionKey === "block-ip"
                ? "Blocking..."
                : "Block IP"}
            </Button>
          </div>
        </form>

        <div className="mt-4">
          {blockedIps.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <ShieldCheck className="mx-auto h-7 w-7 text-muted-foreground" />

              <p className="mt-2 text-sm font-medium">
                No active IP blocks
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Automatic and manual active blocks
                will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedIps.map((block) => (
                <div
                  key={block.id}
                  className="tile flex flex-col gap-4 p-4 md:flex-row md:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold">
                        {block.ip_address}
                      </p>

                      <TonedBadge
                        label={capitalise(
                          block.source,
                        )}
                        tone={
                          block.source ===
                          "automatic"
                            ? "warning"
                            : "primary"
                        }
                      />
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {block.reason ||
                        "No reason recorded."}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {block.blocked_until
                        ? `Blocked until ${formatDateTime(
                            block.blocked_until,
                          )}`
                        : "Blocked until manually removed"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={
                      actionKey ===
                      `unblock-${block.id}`
                    }
                    onClick={() => {
                      void unblockIp(block);
                    }}
                  >
                    {actionKey ===
                    `unblock-${block.id}`
                      ? "Unblocking..."
                      : "Unblock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </StudioPanel>

      <DataTable
        columns={loginColumns}
        rows={loginRows}
        caption="Recent authentication events"
      />
    </PortalPage>
  );
}