import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { TonedBadge } from "@/components/admin/AdminBadges";
import {
  DataTable,
  type Column,
} from "@/components/common/DataTable";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      {
        title: "Audit Logs - YourTeacher Admin",
      },
      {
        name: "description",
        content:
          "Administrative action audit trail across the platform.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminAuditPage,
});

type AuditStats = {
  total_actions: number;
  actions_24h: number;
  actions_7d: number;
  unique_actors: number;
};

type AuditEntry = {
  id: number;
  actor_user_id: number | null;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  target: string;
  method: string;
  route_uri: string | null;
  route_parameters: Record<string, unknown> | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  response_status: number;
  occurred_at: string;
};

type AuditRow = Omit<AuditEntry, "id"> & {
  id: string;
};

type AuditMeta = {
  returned_entries: number;
  max_entries: number;
  append_only: boolean;
};

type AuditResponse = {
  stats?: AuditStats;
  entries?: AuditEntry[];
  meta?: AuditMeta;
  message?: string;
};

const EMPTY_STATS: AuditStats = {
  total_actions: 0,
  actions_24h: 0,
  actions_7d: 0,
  unique_actors: 0,
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
    timeStyle: "medium",
  }).format(date);
}

function prettyAction(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function actionTone(
  action: string,
):
  | "primary"
  | "success"
  | "warning"
  | "destructive" {
  const normalised =
    action.toLowerCase();

  if (
    normalised.includes("delete") ||
    normalised.includes("destroy") ||
    normalised.includes("revoke")
  ) {
    return "destructive";
  }

  if (
    normalised.includes("create") ||
    normalised.includes("store") ||
    normalised.includes("approve")
  ) {
    return "success";
  }

  if (
    normalised.includes("update") ||
    normalised.includes("toggle") ||
    normalised.includes("block") ||
    normalised.includes("resolve")
  ) {
    return "warning";
  }

  return "primary";
}

function matchesRange(
  occurredAt: string,
  range: string,
): boolean {
  if (range === "all") {
    return true;
  }

  const timestamp =
    new Date(occurredAt).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  const windows: Record<
    string,
    number
  > = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  const windowMs = windows[range];

  if (!windowMs) {
    return true;
  }

  return (
    timestamp >=
    Date.now() - windowMs
  );
}

function csvCell(
  value: string,
): string {
  return `"${value.replaceAll(
    '"',
    '""',
  )}"`;
}

const columns: Column<AuditRow>[] = [
  {
    key: "actor",
    header: "Actor",
    render: (row) => (
      <div className="min-w-[10rem]">
        <p className="text-sm font-medium">
          {row.actor_name ?? "Unknown"}
        </p>

        <p className="text-xs text-muted-foreground">
          {row.actor_email ?? "-"}
        </p>
      </div>
    ),
  },
  {
    key: "action",
    header: "Action",
    render: (row) => (
      <TonedBadge
        label={prettyAction(row.action)}
        tone={actionTone(row.action)}
      />
    ),
  },
  {
    key: "target",
    header: "Target",
    render: (row) => (
      <div className="max-w-[25rem]">
        <p className="break-all font-mono text-xs">
          {row.target}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {row.method} · HTTP {row.response_status}
        </p>
      </div>
    ),
  },
  {
    key: "fields",
    header: "Changed fields",
    hideOnMobile: true,
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.changed_fields?.length
          ? row.changed_fields.join(", ")
          : "None"}
      </span>
    ),
  },
  {
    key: "ip",
    header: "IP",
    hideOnMobile: true,
    render: (row) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.ip_address ?? "-"}
      </span>
    ),
  },
  {
    key: "time",
    header: "When",
    render: (row) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDateTime(
          row.occurred_at,
        )}
      </span>
    ),
  },
];

function AdminAuditPage() {
  const [
    stats,
    setStats,
  ] = useState<AuditStats>(
    EMPTY_STATS,
  );

  const [
    entries,
    setEntries,
  ] = useState<AuditEntry[]>([]);

  const [
    meta,
    setMeta,
  ] = useState<AuditMeta | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    actor,
    setActor,
  ] = useState("all");

  const [
    action,
    setAction,
  ] = useState("all");

  const [
    range,
    setRange,
  ] = useState("all");

  async function loadAuditLogs(
    showSuccess = false,
  ) {
    setLoading(true);

    const result =
      await apiRequest<AuditResponse>(
        "/admin/audit-logs",
        {
          method: "GET",
        },
      );

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to load audit logs.",
      );

      setLoading(false);
      return;
    }

    const data =
      (result.data ??
        {}) as AuditResponse;

    setStats(
      data.stats ?? EMPTY_STATS,
    );

    setEntries(
      data.entries ?? [],
    );

    setMeta(
      data.meta ?? null,
    );

    setLoading(false);

    if (showSuccess) {
      toast.success(
        "Audit trail refreshed.",
      );
    }
  }

  useEffect(() => {
    void loadAuditLogs();
  }, []);

  const actorOptions =
    useMemo(() => {
      const map = new Map<
        string,
        string
      >();

      for (const entry of entries) {
        const value =
          entry.actor_user_id !== null
            ? String(entry.actor_user_id)
            : `email:${entry.actor_email ?? "unknown"}`;

        const label =
          entry.actor_name &&
          entry.actor_email
            ? `${entry.actor_name} - ${entry.actor_email}`
            : entry.actor_name ??
              entry.actor_email ??
              "Unknown";

        map.set(value, label);
      }

      return Array.from(
        map.entries(),
      ).map(([value, label]) => ({
        value,
        label,
      }));
    }, [entries]);

  const actionOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            entries.map(
              (entry) => entry.action,
            ),
          ),
        ).sort(),
      [entries],
    );

  const filteredEntries =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return entries.filter(
        (entry) => {
          if (actor !== "all") {
            const actorValue =
              entry.actor_user_id !== null
                ? String(
                    entry.actor_user_id,
                  )
                : `email:${
                    entry.actor_email ??
                    "unknown"
                  }`;

            if (
              actorValue !== actor
            ) {
              return false;
            }
          }

          if (
            action !== "all" &&
            entry.action !== action
          ) {
            return false;
          }

          if (
            !matchesRange(
              entry.occurred_at,
              range,
            )
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const haystack = [
            entry.actor_name,
            entry.actor_email,
            entry.actor_role,
            entry.action,
            entry.target,
            entry.method,
            entry.route_uri,
            entry.ip_address,
            ...(entry.changed_fields ??
              []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            query,
          );
        },
      );
    }, [
      action,
      actor,
      entries,
      range,
      search,
    ]);

  const rows =
    useMemo<AuditRow[]>(
      () =>
        filteredEntries.map(
          (entry) => ({
            ...entry,
            id: String(entry.id),
          }),
        ),
      [filteredEntries],
    );

  function exportAuditTrail() {
    if (
      filteredEntries.length === 0
    ) {
      toast.error(
        "There are no matching audit records to export.",
      );
      return;
    }

    const header = [
      "Time",
      "Actor",
      "Actor Email",
      "Role",
      "Action",
      "Method",
      "Target",
      "Changed Fields",
      "IP Address",
      "HTTP Status",
    ]
      .map(csvCell)
      .join(",");

    const body =
      filteredEntries.map(
        (entry) =>
          [
            entry.occurred_at,
            entry.actor_name ?? "",
            entry.actor_email ?? "",
            entry.actor_role ?? "",
            entry.action,
            entry.method,
            entry.target,
            (
              entry.changed_fields ?? []
            ).join("|"),
            entry.ip_address ?? "",
            String(
              entry.response_status,
            ),
          ]
            .map(csvCell)
            .join(","),
      );

    const csv = [
      header,
      ...body,
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF", csv],
      {
        type: "text/csv;charset=utf-8",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      `yourteacher-audit-trail-${
        new Date()
          .toISOString()
          .slice(0, 10)
      }.csv`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    toast.success(
      `${filteredEntries.length} audit records exported.`,
    );
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Audit Logs"
      description="Append-only trail of successful administrative changes."
      showNotice={false}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={loading}
            onClick={() => {
              void loadAuditLogs(true);
            }}
          >
            <RefreshCw
              className={
                loading
                  ? "size-4 animate-spin"
                  : "size-4"
              }
            />
            Refresh
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={exportAuditTrail}
          >
            <Download className="size-4" />
            Export trail
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="tile p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Total actions
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.total_actions}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Last 24 hours
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.actions_24h}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Last 7 days
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.actions_7d}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Unique actors
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.unique_actors}
          </p>
        </div>
      </div>

      <div className="tile flex flex-col gap-3 p-4 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search audit trail..."
            aria-label="Search audit trail"
            className="h-10 rounded-2xl pl-9"
          />
        </div>

        <Select
          value={actor}
          onValueChange={setActor}
        >
          <SelectTrigger
            className="h-10 w-full rounded-2xl xl:w-[13rem]"
            aria-label="Filter by actor"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All actors
            </SelectItem>

            {actorOptions.map(
              (option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Select
          value={action}
          onValueChange={setAction}
        >
          <SelectTrigger
            className="h-10 w-full rounded-2xl xl:w-[12rem]"
            aria-label="Filter by action"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All actions
            </SelectItem>

            {actionOptions.map(
              (option) => (
                <SelectItem
                  key={option}
                  value={option}
                >
                  {prettyAction(
                    option,
                  )}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Select
          value={range}
          onValueChange={setRange}
        >
          <SelectTrigger
            className="h-10 w-full rounded-2xl xl:w-[11rem]"
            aria-label="Filter by time range"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All time
            </SelectItem>
            <SelectItem value="24h">
              Last 24 hours
            </SelectItem>
            <SelectItem value="7d">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d">
              Last 30 days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Showing {rows.length} of{" "}
          {entries.length} loaded records
        </span>

        {meta ? (
          <span>
            Latest {meta.max_entries} records maximum
          </span>
        ) : null}

        <span>
          No edit or delete action is exposed for audit records.
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        caption="Administrative audit trail"
        emptyTitle="No audit records"
        emptyDescription="Successful administrative changes will appear here automatically."
      />
    </PortalPage>
  );
}