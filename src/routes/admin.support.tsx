import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Search,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { TonedBadge } from "@/components/admin/AdminBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      {
        title: "Support - YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Manage learner, teacher and school support requests.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminSupportPage,
});

type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed";

type TicketPriority =
  | "urgent"
  | "high"
  | "normal"
  | "low";

type TicketCategory =
  | "general"
  | "account"
  | "content"
  | "technical"
  | "billing"
  | "school"
  | "other";

type SupportMessage = {
  id: number;
  user_id: number | null;
  sender_name: string;
  sender_role: string | null;
  message: string;
  is_internal: boolean;
  created_at: string | null;
};

type SupportTicket = {
  id: number;
  ticket_number: string | null;
  requester: {
    id: number | null;
    name: string;
    email: string | null;
    role: string | null;
  };
  subject: string;
  message: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: {
    id: number;
    name: string;
    email: string;
  } | null;
  first_responded_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  messages?: SupportMessage[];
};

type SupportStats = {
  open: number;
  unassigned: number;
  resolved_this_week: number;
  median_first_response_minutes: number | null;
};

type SupportListResponse = {
  tickets: SupportTicket[];
  stats: SupportStats;
};

type SupportShowResponse = {
  ticket: SupportTicket;
};

const emptyStats: SupportStats = {
  open: 0,
  unassigned: 0,
  resolved_this_week: 0,
  median_first_response_minutes: null,
};

function statusLabel(status: TicketStatus) {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "waiting":
      return "Waiting";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return "Open";
  }
}

function priorityLabel(priority: TicketPriority) {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

function categoryLabel(category: TicketCategory) {
  return (
    category.charAt(0).toUpperCase() +
    category.slice(1)
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatResponseTime(
  minutes: number | null,
) {
  if (minutes === null) {
    return "-";
  }

  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
}

function priorityTone(
  priority: TicketPriority,
):
  | "destructive"
  | "warning"
  | "muted"
  | "success" {
  if (priority === "urgent") {
    return "destructive";
  }

  if (priority === "high") {
    return "warning";
  }

  if (priority === "low") {
    return "muted";
  }

  return "success";
}

function statusTone(
  status: TicketStatus,
):
  | "destructive"
  | "warning"
  | "muted"
  | "success"
  | "primary" {
  if (status === "open") {
    return "warning";
  }

  if (status === "in_progress") {
    return "primary";
  }

  if (status === "waiting") {
    return "warning";
  }

  if (status === "resolved") {
    return "success";
  }

  return "muted";
}

function AdminSupportPage() {
  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);

  const [stats, setStats] =
    useState<SupportStats>(emptyStats);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | TicketStatus>(
      "all",
    );

  const [priorityFilter, setPriorityFilter] =
    useState<"all" | TicketPriority>(
      "all",
    );

  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicket | null>(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [busy, setBusy] =
    useState(false);

  const [reply, setReply] =
    useState("");

  const [internalNote, setInternalNote] =
    useState(false);

  async function loadTickets() {
    setLoading(true);
    setError("");

    try {
      const result =
        await apiRequest<SupportListResponse>(
          "/admin/support",
          {
            method: "GET",
          },
        );

      if (!result.ok || !result.data) {
        throw new Error(
          result.message ||
            "Could not load support tickets.",
        );
      }

      setTickets(
        result.data.tickets ?? [],
      );

      setStats(
        result.data.stats ??
          emptyStats,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load support tickets.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  const filteredTickets =
    useMemo(() => {
      const term = search
        .trim()
        .toLowerCase();

      return tickets.filter(
        (ticket) => {
          const matchesStatus =
            statusFilter === "all" ||
            ticket.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter === "all" ||
            ticket.priority ===
              priorityFilter;

          const haystack = [
            ticket.ticket_number ?? "",
            ticket.subject,
            ticket.requester.name,
            ticket.requester.email ?? "",
            ticket.requester.role ?? "",
            ticket.category,
            ticket.priority,
            ticket.status,
            ticket.assignee?.name ?? "",
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            term === "" ||
            haystack.includes(term);

          return (
            matchesStatus &&
            matchesPriority &&
            matchesSearch
          );
        },
      );
    }, [
      tickets,
      search,
      statusFilter,
      priorityFilter,
    ]);

  async function openTicket(id: number) {
    setDetailLoading(true);

    try {
      const result =
        await apiRequest<SupportShowResponse>(
          `/admin/support/${id}`,
          {
            method: "GET",
          },
        );

      if (!result.ok || !result.data) {
        throw new Error(
          result.message ||
            "Could not open ticket.",
        );
      }

      setSelectedTicket(
        result.data.ticket,
      );

      setReply("");
      setInternalNote(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not open ticket.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function refreshSelected() {
    if (!selectedTicket) {
      return;
    }

    await openTicket(
      selectedTicket.id,
    );
  }

  async function assignToMe(
    ticket: SupportTicket,
  ) {
    setBusy(true);

    try {
      const result =
        await apiRequest(
          `/admin/support/${ticket.id}/assign-to-me`,
          {
            method: "POST",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not assign ticket.",
        );
      }

      toast.success(
        "Ticket assigned to you.",
      );

      await loadTickets();

      if (
        selectedTicket?.id ===
        ticket.id
      ) {
        await refreshSelected();
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not assign ticket.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function updateTicket(
    ticket: SupportTicket,
    values: {
      status?: TicketStatus;
      priority?: TicketPriority;
      category?: TicketCategory;
      assigned_to?: number | null;
    },
  ) {
    setBusy(true);

    try {
      const result =
        await apiRequest(
          `/admin/support/${ticket.id}`,
          {
            method: "PATCH",
            body: values,
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not update ticket.",
        );
      }

      toast.success(
        "Support ticket updated.",
      );

      await loadTickets();

      if (
        selectedTicket?.id ===
        ticket.id
      ) {
        await refreshSelected();
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update ticket.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitReply() {
    if (!selectedTicket) {
      return;
    }

    const message = reply.trim();

    if (!message) {
      toast.error(
        "Enter a reply or internal note.",
      );
      return;
    }

    setBusy(true);

    try {
      const result =
        await apiRequest(
          `/admin/support/${selectedTicket.id}/messages`,
          {
            method: "POST",
            body: {
              message,
              is_internal: internalNote,
            },
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not add message.",
        );
      }

      toast.success(
        internalNote
          ? "Internal note added."
          : "Reply added.",
      );

      setReply("");
      setInternalNote(false);

      await loadTickets();
      await refreshSelected();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not add message.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteTicket(
    ticket: SupportTicket,
  ) {
    const confirmed = window.confirm(
      `Permanently delete ${ticket.ticket_number ?? "this support ticket"}? This will also delete all conversation messages. This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);

    try {
      const result = await apiRequest(
        `/admin/support/${ticket.id}`,
        {
          method: "DELETE",
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete support ticket.",
        );
      }

      toast.success(
        result.message ||
          "Support ticket deleted.",
      );

      setSelectedTicket(null);
      setReply("");
      setInternalNote(false);

      await loadTickets();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete support ticket.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Support"
      description="Manage requests from learners, teachers and schools."
      showNotice={false}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Open tickets"
            value={String(stats.open)}
            hint="Open, in progress or waiting"
            tone="warning"
          />

          <StatCard
            label="Unassigned"
            value={String(
              stats.unassigned,
            )}
            hint="Needs an administrator"
            tone="warning"
          />

          <StatCard
            label="Resolved this week"
            value={String(
              stats.resolved_this_week,
            )}
            tone="success"
          />

          <StatCard
            label="First response"
            value={formatResponseTime(
              stats.median_first_response_minutes,
            )}
            hint="Median"
            tone="primary"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border bg-card p-4 shadow-sm xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search tickets..."
              className="pl-9"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target
                  .value as
                  | "all"
                  | TicketPriority,
              )
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              All priorities
            </option>
            <option value="urgent">
              Urgent
            </option>
            <option value="high">
              High
            </option>
            <option value="normal">
              Normal
            </option>
            <option value="low">
              Low
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as
                  | "all"
                  | TicketStatus,
              )
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              All statuses
            </option>
            <option value="open">
              Open
            </option>
            <option value="in_progress">
              In progress
            </option>
            <option value="waiting">
              Waiting
            </option>
            <option value="resolved">
              Resolved
            </option>
            <option value="closed">
              Closed
            </option>
          </select>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() =>
              void loadTickets()
            }
          >
            <RefreshCw
              className={`mr-2 size-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    Ticket
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Requester
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Priority
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Assigned
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map(
                  (ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold">
                          {ticket.subject}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {ticket.ticket_number ??
                            `Ticket ${ticket.id}`}{" "}
                          |{" "}
                          {categoryLabel(
                            ticket.category,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p>
                          {
                            ticket.requester
                              .name
                          }
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {ticket.requester
                            .email ?? "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <TonedBadge
                          label={priorityLabel(
                            ticket.priority,
                          )}
                          tone={priorityTone(
                            ticket.priority,
                          )}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <TonedBadge
                          label={statusLabel(
                            ticket.status,
                          )}
                          tone={statusTone(
                            ticket.status,
                          )}
                        />
                      </td>

                      <td className="px-4 py-4">
                        {ticket.assignee
                          ?.name ??
                          "Unassigned"}
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {formatDate(
                          ticket.updated_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              detailLoading
                            }
                            onClick={() =>
                              void openTicket(
                                ticket.id,
                              )
                            }
                          >
                            <MessageSquare className="mr-1 size-4" />
                            Open
                          </Button>

                          {!ticket.assignee &&
                          ticket.status !==
                            "closed" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                busy
                              }
                              onClick={() =>
                                void assignToMe(
                                  ticket,
                                )
                              }
                            >
                              <UserCheck className="mr-1 size-4" />
                              Assign to me
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ),
                )}

                {!loading &&
                filteredTickets.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No support tickets
                      found.
                    </td>
                  </tr>
                ) : null}

                {loading &&
                tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      Loading support
                      tickets...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTicket ? (
          <div className="rounded-3xl border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {selectedTicket.ticket_number ??
                    `Ticket ${selectedTicket.id}`}
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {
                    selectedTicket.subject
                  }
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  From{" "}
                  {
                    selectedTicket
                      .requester.name
                  }
                  {selectedTicket.requester
                    .email
                    ? ` (${selectedTicket.requester.email})`
                    : ""}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setSelectedTicket(
                    null,
                  )
                }
              >
                Close details
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>
                <div className="mt-1">
                  <TonedBadge
                    label={statusLabel(
                      selectedTicket.status,
                    )}
                    tone={statusTone(
                      selectedTicket.status,
                    )}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Priority
                </p>

                <select
                  value={
                    selectedTicket.priority
                  }
                  disabled={busy}
                  onChange={(event) =>
                    void updateTicket(
                      selectedTicket,
                      {
                        priority:
                          event.target
                            .value as TicketPriority,
                      },
                    )
                  }
                  className="mt-1 h-9 rounded-md border bg-background px-2 text-sm"
                >
                  <option value="urgent">
                    Urgent
                  </option>
                  <option value="high">
                    High
                  </option>
                  <option value="normal">
                    Normal
                  </option>
                  <option value="low">
                    Low
                  </option>
                </select>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Category
                </p>

                <select
                  value={
                    selectedTicket.category
                  }
                  disabled={busy}
                  onChange={(event) =>
                    void updateTicket(
                      selectedTicket,
                      {
                        category:
                          event.target
                            .value as TicketCategory,
                      },
                    )
                  }
                  className="mt-1 h-9 rounded-md border bg-background px-2 text-sm"
                >
                  <option value="general">
                    General
                  </option>
                  <option value="account">
                    Account
                  </option>
                  <option value="content">
                    Content
                  </option>
                  <option value="technical">
                    Technical
                  </option>
                  <option value="billing">
                    Billing
                  </option>
                  <option value="school">
                    School
                  </option>
                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Assigned to
                </p>
                <p className="mt-1 text-sm font-medium">
                  {selectedTicket.assignee
                    ?.name ??
                    "Unassigned"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Original request
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm">
                {
                  selectedTicket.message
                }
              </p>

              <p className="mt-3 text-xs text-muted-foreground">
                Created{" "}
                {formatDate(
                  selectedTicket.created_at,
                )}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {!selectedTicket.assignee &&
              selectedTicket.status !==
                "closed" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void assignToMe(
                      selectedTicket,
                    )
                  }
                >
                  <UserCheck className="mr-2 size-4" />
                  Assign to me
                </Button>
              ) : null}

              {selectedTicket.status !==
                "waiting" &&
              selectedTicket.status !==
                "closed" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void updateTicket(
                      selectedTicket,
                      {
                        status:
                          "waiting",
                      },
                    )
                  }
                >
                  Waiting
                </Button>
              ) : null}

              {selectedTicket.status !==
                "resolved" &&
              selectedTicket.status !==
                "closed" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void updateTicket(
                      selectedTicket,
                      {
                        status:
                          "resolved",
                      },
                    )
                  }
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Resolve
                </Button>
              ) : null}

              {selectedTicket.status ===
                "resolved" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void updateTicket(
                      selectedTicket,
                      {
                        status: "open",
                      },
                    )
                  }
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reopen
                </Button>
              ) : null}

              {selectedTicket.status !==
                "closed" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    const confirmed =
                      window.confirm(
                        "Close this support ticket?",
                      );

                    if (confirmed) {
                      void updateTicket(
                        selectedTicket,
                        {
                          status:
                            "closed",
                        },
                      );
                    }
                  }}
                >
                  <XCircle className="mr-2 size-4" />
                  Close ticket
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void updateTicket(
                      selectedTicket,
                      {
                        status: "open",
                      },
                    )
                  }
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reopen
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() =>
                  void deleteTicket(
                    selectedTicket,
                  )
                }
              >
                Delete ticket
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">
                Conversation
              </h3>

              <div className="mt-3 space-y-3">
                {selectedTicket.messages
                  ?.length ? (
                  selectedTicket.messages.map(
                    (message) => (
                      <div
                        key={message.id}
                        className={`rounded-2xl border p-4 ${
                          message.is_internal
                            ? "border-warning/30 bg-warning/5"
                            : "bg-muted/20"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {
                              message.sender_name
                            }
                          </span>

                          {message.sender_role ? (
                            <span>
                              {
                                message.sender_role
                              }
                            </span>
                          ) : null}

                          {message.is_internal ? (
                            <span className="font-medium text-warning">
                              Internal note
                            </span>
                          ) : null}

                          <span>
                            {formatDate(
                              message.created_at,
                            )}
                          </span>
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm">
                          {
                            message.message
                          }
                        </p>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No replies yet.
                  </p>
                )}
              </div>
            </div>

            {selectedTicket.status !==
            "closed" ? (
              <form
                className="mt-6 rounded-2xl border p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitReply();
                }}
              >
                <label className="text-sm font-medium">
                  Reply or internal note
                </label>

                <textarea
                  value={reply}
                  onChange={(event) =>
                    setReply(
                      event.target.value,
                    )
                  }
                  rows={5}
                  placeholder="Write your response..."
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      internalNote
                    }
                    onChange={(
                      event,
                    ) =>
                      setInternalNote(
                        event.target
                          .checked,
                      )
                    }
                  />

                  Internal note only
                </label>

                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      busy ||
                      !reply.trim()
                    }
                  >
                    <MessageSquare className="mr-2 size-4" />
                    {internalNote
                      ? "Add internal note"
                      : "Send reply"}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </PortalPage>
  );
}