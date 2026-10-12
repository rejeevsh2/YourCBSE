import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { ApprovalBadge } from "@/components/admin/AdminBadges";
import { StatCard } from "@/components/common/StatCard";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/approvals")({
  head: () => ({
    meta: [
      {
        title: "Approvals - YourTeacher Admin",
      },
      {
        name: "description",
        content:
          "Review and approve submitted content before publication.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminApprovalsPage,
});

type ApprovalStatus =
  | "pending"
  | "approved"
  | "needs_revision"
  | "rejected";

type ApprovalState =
  | "Pending"
  | "Approved"
  | "Needs revision"
  | "Rejected";

type ApprovalItem = {
  id: number;
  approvable_type: string;
  approvable_id: number;
  title: string;
  kind: string;
  published: boolean;
  status: ApprovalStatus;
  note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  submitted_by: string | null;
  submitted_by_email: string | null;
  reviewed_by: string | null;
};

type ApprovalStats = {
  pending: number;
  approved: number;
  needs_revision: number;
  rejected: number;
};

type ApprovalResponse = {
  approvals: ApprovalItem[];
  stats: ApprovalStats;
};

const emptyStats: ApprovalStats = {
  pending: 0,
  approved: 0,
  needs_revision: 0,
  rejected: 0,
};

function displayState(
  status: ApprovalStatus,
): ApprovalState {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "needs_revision") {
    return "Needs revision";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending";
}

function formatDate(
  value: string | null,
): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function AdminApprovalsPage() {
  const [items, setItems] =
    useState<ApprovalItem[]>([]);

  const [stats, setStats] =
    useState<ApprovalStats>(emptyStats);

  const [loading, setLoading] =
    useState(true);

  const [reviewingId, setReviewingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | ApprovalStatus>(
      "all",
    );

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const result =
        await apiRequest<ApprovalResponse>(
          "/admin/approvals",
          {
            method: "GET",
          },
        );

      if (!result.ok || !result.data) {
        throw new Error(
          result.message ||
            "Could not load approval requests.",
        );
      }

      setItems(
        result.data.approvals ?? [],
      );

      setStats(
        result.data.stats ??
          emptyStats,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load approval requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredItems =
    useMemo(() => {
      const term = search
        .trim()
        .toLowerCase();

      return items.filter(
        (item) => {
          const matchesStatus =
            statusFilter === "all" ||
            item.status ===
              statusFilter;

          const haystack = [
            item.title,
            item.kind,
            item.submitted_by ?? "",
            item.submitted_by_email ??
              "",
            item.note ?? "",
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            term === "" ||
            haystack.includes(term);

          return (
            matchesStatus &&
            matchesSearch
          );
        },
      );
    }, [
      items,
      search,
      statusFilter,
    ]);

  async function review(
    item: ApprovalItem,
    status:
      | "approved"
      | "needs_revision"
      | "rejected",
  ) {
    let note: string | null =
      null;

    if (
      status ===
        "needs_revision" ||
      status === "rejected"
    ) {
      const promptText =
        status ===
        "needs_revision"
          ? "Enter the changes required:"
          : "Enter the rejection reason:";

      const entered =
        window.prompt(
          promptText,
          item.note ?? "",
        );

      if (entered === null) {
        return;
      }

      note = entered.trim();

      if (!note) {
        toast.error(
          "A review note is required.",
        );
        return;
      }
    }

    if (
      status === "approved"
    ) {
      const confirmed =
        window.confirm(
          `Approve "${item.title}" and publish it?`,
        );

      if (!confirmed) {
        return;
      }
    }

    setReviewingId(item.id);

    try {
      const result =
        await apiRequest<{
          message?: string;
        }>(
          `/admin/approvals/${item.id}`,
          {
            method: "PATCH",
            body: {
              status,
              note,
            },
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not update this approval request.",
        );
      }

      if (
        status === "approved"
      ) {
        toast.success(
          "Submission approved and published.",
        );
      } else if (
        status ===
        "needs_revision"
      ) {
        toast.success(
          "Submission returned for revision.",
        );
      } else {
        toast.success(
          "Submission rejected.",
        );
      }

      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not review submission.",
      );
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Approvals"
      description="Review teacher submissions before they are published."
      showNotice={false}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Pending"
            value={String(
              stats.pending,
            )}
            hint="Needs review"
            tone="warning"
          />

          <StatCard
            label="Approved"
            value={String(
              stats.approved,
            )}
            tone="success"
          />

          <StatCard
            label="Needs revision"
            value={String(
              stats.needs_revision,
            )}
            tone="warning"
          />

          <StatCard
            label="Rejected"
            value={String(
              stats.rejected,
            )}
            tone="destructive"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search submissions..."
              className="pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as
                  | "all"
                  | ApprovalStatus,
              )
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              All states
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="needs_revision">
              Needs revision
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void loadData()
            }
            disabled={loading}
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
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    Submission
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Submitted by
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Submitted
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    State
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Review
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map(
                  (item) => {
                    const busy =
                      reviewingId ===
                      item.id;

                    return (
                      <tr
                        key={item.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold">
                            {
                              item.title
                            }
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.kind} |
                            ID{" "}
                            {
                              item.approvable_id
                            }
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.published
                              ? "Published"
                              : "Not published"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p>
                            {item.submitted_by ??
                              "Unknown"}
                          </p>

                          {item.submitted_by_email ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {
                                item.submitted_by_email
                              }
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDate(
                            item.submitted_at,
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <ApprovalBadge
                            state={displayState(
                              item.status,
                            )}
                          />
                        </td>

                        <td className="max-w-[280px] px-4 py-4">
                          {item.note ? (
                            <p>
                              {
                                item.note
                              }
                            </p>
                          ) : (
                            <span className="text-muted-foreground">
                              -
                            </span>
                          )}

                          {item.reviewed_by ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Reviewed by{" "}
                              {
                                item.reviewed_by
                              }
                            </p>
                          ) : null}

                          {item.reviewed_at ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(
                                item.reviewed_at,
                              )}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          {item.status ===
                          "pending" ? (
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void review(
                                    item,
                                    "approved",
                                  )
                                }
                              >
                                <Check className="mr-1 size-4 text-success" />
                                Approve
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void review(
                                    item,
                                    "needs_revision",
                                  )
                                }
                              >
                                <RotateCcw className="mr-1 size-4 text-warning" />
                                Needs revision
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void review(
                                    item,
                                    "rejected",
                                  )
                                }
                              >
                                <X className="mr-1 size-4 text-destructive" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <p className="text-right text-xs text-muted-foreground">
                              Reviewed
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}

                {!loading &&
                filteredItems.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No approval
                      requests found.
                    </td>
                  </tr>
                ) : null}

                {loading &&
                items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      Loading approval
                      requests...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalPage>
  );
}