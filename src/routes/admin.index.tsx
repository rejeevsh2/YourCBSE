import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  HardDrive,
  ServerCog,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PhaseNotice } from "@/components/common/PhaseNotice";
import { StatCard } from "@/components/common/StatCard";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { BarChart, ChartPanel, RankedBars, SegmentedBar } from "@/components/admin/Charts";
import { ApprovalBadge, TonedBadge } from "@/components/admin/AdminBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  adminActivity,
  adminApprovals,
  adminKpis,
  adminRoles,
  adminSystemLogs,
  monthLabels,
  mostViewedChapters,
  platformActivityBreakdown,
  trafficSeries,
} from "@/data/admin";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Control Center — YourCBSE" },
      { name: "description", content: "Platform-wide overview of users, content, traffic and system health." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const logTone = {
  INFO: "primary",
  WARN: "warning",
  ERROR: "destructive",
} as const;

function AdminDashboard() {
  const pending = adminApprovals.filter((entry) => entry.state === "Pending");

  return (
    <>
      <PageHeader
        title="Control Center"
        description="Platform health, content coverage, traffic and access — at a glance."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Dashboard" }]}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/admin/reports">
                <ArrowUpRight className="size-4" /> Reports
              </Link>
            </Button>
            <Button asChild className="rounded-2xl">
              <Link to="/admin/settings">
                <ServerCog className="size-4" /> Website settings
              </Link>
            </Button>
          </>
        }
      />
      <PhaseNotice />

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminKpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartPanel
          title="Platform traffic"
          subtitle="Sessions per month, last 12 months"
          className="lg:col-span-2"
          action={<Badge variant="secondary">+11.2% MoM</Badge>}
        >
          <BarChart data={trafficSeries} labels={monthLabels} ariaLabel="Monthly platform traffic" />
        </ChartPanel>

        <StudioPanel title="Recent activity" icon={Activity}>
          <ul className="space-y-3">
            {adminActivity.map((entry) => (
              <li key={entry.id} className="flex gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={
                    entry.tone === "success"
                      ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-success"
                      : entry.tone === "warning"
                        ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-warning"
                        : "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  }
                />
                <span className="min-w-0">
                  <span className="block">{entry.text}</span>
                  <span className="text-xs text-muted-foreground">{entry.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartPanel title="Most viewed chapters" subtitle="Last 30 days" className="lg:col-span-2">
          <RankedBars
            ariaLabel="Most viewed chapters"
            items={mostViewedChapters.map((chapter) => ({
              id: chapter.id,
              label: chapter.title,
              caption: chapter.grade,
              value: `${(chapter.views / 1000).toFixed(1)}k`,
              share: chapter.share,
            }))}
          />
        </ChartPanel>

        <ChartPanel title="Activity mix" subtitle="Share of platform events">
          <SegmentedBar items={platformActivityBreakdown} ariaLabel="Platform activity breakdown" />
        </ChartPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StudioPanel
          title="Pending approvals"
          icon={BadgeCheck}
          action={
            <Button asChild size="sm" variant="ghost" className="rounded-2xl">
              <Link to="/admin/approvals">Open</Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {pending.map((entry) => (
              <li key={entry.id} className="tile space-y-2 p-4">
                <p className="text-sm font-semibold">{entry.title}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.kind} · {entry.submittedBy} · {entry.submittedAt}
                </p>
                <ApprovalBadge state={entry.state} />
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Storage & system" icon={HardDrive}>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Media storage</span>
              <span className="font-semibold">712 GB / 1 TB</span>
            </div>
            <Progress value={71} aria-label="Storage usage" />
          </div>
          <ul className="space-y-2 pt-2">
            {adminSystemLogs.slice(0, 4).map((log) => (
              <li key={log.id} className="flex items-start gap-2 text-xs">
                <TonedBadge label={log.level} tone={logTone[log.level]} />
                <span className="min-w-0 flex-1 text-muted-foreground">{log.message}</span>
                <span className="shrink-0 text-muted-foreground">{log.time}</span>
              </li>
            ))}
          </ul>
        </StudioPanel>

        <StudioPanel title="Roles" icon={ShieldAlert}>
          <ul className="space-y-3">
            {adminRoles.map((role) => (
              <li key={role.id} className="flex items-center gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{role.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{role.scope}</p>
                </div>
                <span className="ml-auto shrink-0 text-xs font-semibold text-muted-foreground">
                  {role.members.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </>
  );
}
