import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/auth/http";
export const Route = createFileRoute("/admin/")({ component: AdminHome });
function AdminHome() {
  const [stats, setStats] = useState<{
    students: number;
    teachers: number;
    lessons: number;
    drafts: number;
  } | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const r = await apiRequest<typeof stats>("/admin/stats", { method: "GET" });
    if (r.ok && r.data) {
      setStats(r.data);
      setError("");
    } else setError(r.message);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="YourSchool administration"
      description="Manage accounts, curriculum, lessons, and practice."
      showNotice={false}
    >
      {error && (
        <p role="alert">
          {error} <Button onClick={load}>Retry</Button>
        </p>
      )}
      {!stats && !error && <p>Loading…</p>}
      {stats && (
        <StatGrid
          items={[
            { label: "Students", value: String(stats.students), tone: "primary" },
            { label: "Teachers", value: String(stats.teachers), tone: "primary" },
            { label: "Lessons", value: String(stats.lessons), tone: "success" },
            { label: "Unpublished lessons", value: String(stats.drafts), tone: "warning" },
          ]}
        />
      )}
      <section className="tile flex flex-wrap gap-3 p-6">
        <Button asChild>
          <Link to="/admin/grades">Curriculum</Link>
        </Button>
        <Button asChild>
          <Link to="/admin/lessons">Review & publish lessons</Link>
        </Button>
        <Button asChild>
          <Link to="/admin/question-bank">Question bank</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/users">User accounts</Link>
        </Button>
      </section>
    </PortalPage>
  );
}
