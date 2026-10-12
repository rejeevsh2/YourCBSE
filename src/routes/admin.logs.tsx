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

export const Route = createFileRoute("/admin/logs")({
  head: () => ({
    meta: [
      {
        title: "System Logs - YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Laravel application log stream and diagnostics.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminLogsPage,
});

type SystemLogEntry = {
  id: string;
  timestamp: string;
  level: string;
  source: string;
  message: string;
};

type SystemLogMeta = {
  file: string;
  exists: boolean;
  file_size_bytes: number;
  read_bytes: number;
  truncated: boolean;
  returned_entries: number;
  max_entries: number;
  last_modified: string | null;
};

type SystemLogsResponse = {
  entries?: SystemLogEntry[];
  meta?: SystemLogMeta;
  message?: string;
};

function levelTone(
  level: string,
):
  | "primary"
  | "success"
  | "warning"
  | "destructive" {
  switch (level.toUpperCase()) {
    case "ERROR":
    case "CRITICAL":
    case "ALERT":
    case "EMERGENCY":
      return "destructive";

    case "WARNING":
    case "WARN":
      return "warning";

    case "INFO":
      return "success";

    default:
      return "primary";
  }
}

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

function formatBytes(
  bytes: number,
): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes /
    1024 ** index;

  return `${
    value >= 10 || index === 0
      ? value.toFixed(0)
      : value.toFixed(1)
  } ${units[index]}`;
}

function matchesRange(
  timestamp: string,
  range: string,
): boolean {
  if (range === "all") {
    return true;
  }

  const time = new Date(
    timestamp,
  ).getTime();

  if (Number.isNaN(time)) {
    return false;
  }

  const now = Date.now();

  const ranges: Record<
    string,
    number
  > = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };

  const windowMs = ranges[range];

  if (!windowMs) {
    return true;
  }

  return time >= now - windowMs;
}

function csvCell(
  value: string,
): string {
  return `"${value.replaceAll(
    '"',
    '""',
  )}"`;
}

const columns: Column<SystemLogEntry>[] = [
  {
    key: "level",
    header: "Level",
    render: (row) => (
      <TonedBadge
        label={row.level}
        tone={levelTone(row.level)}
      />
    ),
  },
  {
    key: "source",
    header: "Source",
    hideOnMobile: true,
    render: (row) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.source}
      </span>
    ),
  },
  {
    key: "message",
    header: "Message",
    render: (row) => (
      <span className="whitespace-pre-wrap break-words text-sm">
        {row.message}
      </span>
    ),
  },
  {
    key: "time",
    header: "Time",
    hideOnMobile: true,
    render: (row) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDateTime(
          row.timestamp,
        )}
      </span>
    ),
  },
];

function AdminLogsPage() {
  const [
    entries,
    setEntries,
  ] = useState<
    SystemLogEntry[]
  >([]);

  const [
    meta,
    setMeta,
  ] = useState<
    SystemLogMeta | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    level,
    setLevel,
  ] = useState("all");

  const [
    range,
    setRange,
  ] = useState("all");

  async function loadLogs(
    showSuccess = false,
  ) {
    setLoading(true);

    const result =
      await apiRequest<SystemLogsResponse>(
        "/admin/system-logs",
        {
          method: "GET",
        },
      );

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to load system logs.",
      );

      setLoading(false);
      return;
    }

    const data =
      (result.data ??
        {}) as SystemLogsResponse;

    setEntries(
      data.entries ?? [],
    );

    setMeta(
      data.meta ?? null,
    );

    setLoading(false);

    if (showSuccess) {
      toast.success(
        "System logs refreshed.",
      );
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  const filteredEntries =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return entries.filter(
        (entry) => {
          if (
            level !== "all" &&
            entry.level.toUpperCase() !==
              level.toUpperCase()
          ) {
            return false;
          }

          if (
            !matchesRange(
              entry.timestamp,
              range,
            )
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const haystack = [
            entry.level,
            entry.source,
            entry.message,
            entry.timestamp,
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            query,
          );
        },
      );
    }, [
      entries,
      level,
      range,
      search,
    ]);

  const errorCount =
    entries.filter((entry) =>
      [
        "ERROR",
        "CRITICAL",
        "ALERT",
        "EMERGENCY",
      ].includes(
        entry.level.toUpperCase(),
      ),
    ).length;

  const warningCount =
    entries.filter((entry) =>
      [
        "WARNING",
        "WARN",
      ].includes(
        entry.level.toUpperCase(),
      ),
    ).length;

  function exportLogs() {
    if (
      filteredEntries.length === 0
    ) {
      toast.error(
        "There are no matching logs to export.",
      );
      return;
    }

    const header = [
      "Time",
      "Level",
      "Source",
      "Message",
    ]
      .map(csvCell)
      .join(",");

    const rows =
      filteredEntries.map(
        (entry) =>
          [
            entry.timestamp,
            entry.level,
            entry.source,
            entry.message,
          ]
            .map(csvCell)
            .join(","),
      );

    const csv = [
      header,
      ...rows,
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
      `yourschool-system-logs-${
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
      `${filteredEntries.length} log entries exported.`,
    );
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="System Logs"
      description="Real Laravel application events from the local log file."
      showNotice={false}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={loading}
            onClick={() => {
              void loadLogs(true);
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
            onClick={exportLogs}
          >
            <Download className="size-4" />
            Export logs
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="tile p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Loaded entries
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {entries.length}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Errors
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {errorCount}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Warnings
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {warningCount}
          </p>
        </div>

        <div className="tile p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Log file size
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {formatBytes(
              meta?.file_size_bytes ??
                0,
            )}
          </p>
        </div>
      </div>

      <div className="tile flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
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
            placeholder="Search log messages..."
            className="h-10 rounded-2xl pl-9"
          />
        </div>

        <Select
          value={level}
          onValueChange={setLevel}
        >
          <SelectTrigger
            className="h-10 w-full rounded-2xl sm:w-[10rem]"
            aria-label="Filter by log level"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All levels
            </SelectItem>
            <SelectItem value="DEBUG">
              DEBUG
            </SelectItem>
            <SelectItem value="INFO">
              INFO
            </SelectItem>
            <SelectItem value="NOTICE">
              NOTICE
            </SelectItem>
            <SelectItem value="WARNING">
              WARNING
            </SelectItem>
            <SelectItem value="ERROR">
              ERROR
            </SelectItem>
            <SelectItem value="CRITICAL">
              CRITICAL
            </SelectItem>
            <SelectItem value="ALERT">
              ALERT
            </SelectItem>
            <SelectItem value="EMERGENCY">
              EMERGENCY
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={range}
          onValueChange={setRange}
        >
          <SelectTrigger
            className="h-10 w-full rounded-2xl sm:w-[10rem]"
            aria-label="Filter by time range"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All time
            </SelectItem>
            <SelectItem value="1h">
              Last hour
            </SelectItem>
            <SelectItem value="24h">
              Last 24 hours
            </SelectItem>
            <SelectItem value="7d">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {meta ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            File: {meta.file}
          </span>

          <span>
            Last modified:{" "}
            {formatDateTime(
              meta.last_modified,
            )}
          </span>

          <span>
            Showing{" "}
            {filteredEntries.length} of{" "}
            {entries.length}
          </span>

          {meta.truncated ? (
            <span>
              Reading the latest{" "}
              {formatBytes(
                meta.read_bytes,
              )} of the log file.
            </span>
          ) : null}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={filteredEntries}
        loading={loading}
        caption="System log stream"
        emptyTitle="No system log entries"
        emptyDescription="Laravel has not written any matching log entries yet."
      />
    </PortalPage>
  );
}