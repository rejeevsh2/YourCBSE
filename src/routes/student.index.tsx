import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { StatGrid } from "@/components/common/StatCard";
import { apiRequest } from "@/lib/auth/http";
import { getStoredUser } from "@/lib/auth";

type Notice = { id: string; data: { title?: string; message?: string }; read: boolean };
type Dashboard = {
  stats: {
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    percentage: number;
  };
  progress: { lesson: { id: number; title: string }; is_completed: boolean } | null;
  activities: { id: number; lesson: string; chapter: string; completed: boolean; time: string }[];
  notifications: Notice[];
  unreadCount: number;
};
export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — YourTeacher.co.in" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentDashboard,
});
function StudentDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [name, setName] = useState("Student");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => {
    setError("");
    const [stats, progress, activity, notices] = await Promise.all([
      apiRequest<Dashboard["stats"]>("/dashboard/stats", { method: "GET" }),
      apiRequest<{ progress: Dashboard["progress"] }>("/lesson-progress/continue", {
        method: "GET",
      }),
      apiRequest<{ activities: Dashboard["activities"] }>("/recent-activity", { method: "GET" }),
      apiRequest<{ notifications: Notice[]; unreadCount: number }>("/notifications", {
        method: "GET",
      }),
    ]);
    if (!stats.ok || !progress.ok || !activity.ok || !notices.ok) {
      setError(
        [stats, progress, activity, notices].find((r) => !r.ok)?.message ??
          "Could not load dashboard.",
      );
      return;
    }
    if (stats.data && progress.data && activity.data && notices.data)
      setData({
        stats: stats.data,
        progress: progress.data.progress,
        activities: activity.data.activities,
        ...notices.data,
      });
  }, []);
  useEffect(() => {
    setName(getStoredUser()?.fullName || "Student");
    void load();
  }, [load]);
  async function markRead(id: string) {
    setBusy(id);
    const r = await apiRequest<{ unreadCount: number }>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
    if (r.ok && r.data)
      setData((d) =>
        d
          ? {
              ...d,
              unreadCount: r.data!.unreadCount,
              notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            }
          : d,
      );
    else setError(r.message);
    setBusy(null);
  }
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title={`Welcome, ${name}`}
      description="Your lessons, progress, and latest updates."
      showNotice={false}
      actions={
        <Button asChild>
          <Link to="/student/learning-hub">Browse lessons</Link>
        </Button>
      }
    >
      {error && (
        <div role="alert" className="tile p-5">
          {error}{" "}
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </div>
      )}
      {!data && !error && <p role="status">Loading your dashboard…</p>}
      {data && (
        <>
          <StatGrid
            items={[
              {
                label: "Available lessons",
                value: String(data.stats.totalLessons),
                tone: "primary",
              },
              { label: "Completed", value: String(data.stats.completedLessons), tone: "success" },
              {
                label: "In progress",
                value: String(data.stats.inProgressLessons),
                tone: "warning",
              },
              { label: "Overall completion", value: `${data.stats.percentage}%`, tone: "primary" },
            ]}
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="tile space-y-4 p-6">
              <h2 className="text-xl font-bold">Continue learning</h2>
              {data.progress ? (
                <>
                  <p>{data.progress.lesson.title}</p>
                  <Button asChild>
                    <Link
                      to="/student/lesson/$lessonId"
                      params={{ lessonId: String(data.progress.lesson.id) }}
                    >
                      Open lesson
                    </Link>
                  </Button>
                </>
              ) : (
                <p>Open your first lesson to begin tracking progress.</p>
              )}
              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button asChild variant="outline">
                  <Link to="/student/practice">Practice</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/student/interactive-revision">Revise</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/student/bookmarks">Bookmarks</Link>
                </Button>
              </div>
            </section>
            <section className="tile space-y-4 p-6">
              <h2 className="text-xl font-bold">
                Notifications{" "}
                {data.unreadCount > 0 && (
                  <span className="text-primary">({data.unreadCount} unread)</span>
                )}
              </h2>
              {!data.notifications.length && <p>No notifications yet.</p>}
              {data.notifications.slice(0, 5).map((n) => (
                <button
                  key={n.id}
                  disabled={!!busy || n.read}
                  className="block w-full rounded-xl border p-3 text-left disabled:cursor-default"
                  onClick={() => markRead(n.id)}
                >
                  <strong>
                    {!n.read && (
                      <span
                        aria-label="Unread"
                        className="mr-2 inline-block size-2 rounded-full bg-primary"
                      />
                    )}
                    {n.data.title || "Update"}
                  </strong>
                  <p className="text-sm text-muted-foreground">{n.data.message}</p>
                </button>
              ))}
              <Link className="text-primary underline" to="/student/notifications">
                View all notifications
              </Link>
            </section>
          </div>
          <section className="tile space-y-4 p-6">
            <h2 className="text-xl font-bold">Recent activity</h2>
            {!data.activities.length && <p>Your learning activity will appear here.</p>}
            {data.activities.map((a) => (
              <div className="border-b pb-3" key={a.id}>
                <p>
                  {a.completed ? "Completed" : "Opened"}: {a.lesson}
                </p>
                <p className="text-sm text-muted-foreground">
                  {a.chapter} · {a.time}
                </p>
              </div>
            ))}
          </section>
        </>
      )}
    </PortalPage>
  );
}
