import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/auth/http";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
type Task = {
  id: number;
  title: string;
  notes: string | null;
  due_date: string;
  minutes: number;
  category: string;
  done: boolean;
};
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function LivePlanner({ calendar = false }: { calendar?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [category, setCategory] = useState("Learn");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<number | null>(null);
  const load = useCallback(async () => {
    const r = await apiRequest<{ tasks: Task[] }>("/student/planner/tasks", { method: "GET" });
    if (r.ok && r.data) {
      setTasks(r.data.tasks);
      setLoaded(true);
    } else setError(r.message);
  }, []);
  useEffect(() => {
    setDate(localToday());
    void load();
  }, [load]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await apiRequest(
      editing ? `/student/planner/tasks/${editing}` : "/student/planner/tasks",
      {
        method: editing ? "PATCH" : "POST",
        body: { title, notes, due_date: date, minutes, category },
      },
    );
    if (r.ok) {
      setTitle("");
      setNotes("");
      setEditing(null);
      await load();
    } else setError(r.message);
    setBusy(false);
  }
  async function toggle(t: Task) {
    setBusy(true);
    const r = await apiRequest<{ task: Task }>(`/student/planner/tasks/${t.id}`, {
      method: "PATCH",
      body: { done: !t.done },
    });
    if (r.ok && r.data) setTasks((v) => v.map((x) => (x.id === t.id ? r.data!.task : x)));
    else setError(r.message);
    setBusy(false);
  }
  async function remove(id: number) {
    setBusy(true);
    const r = await apiRequest(`/student/planner/tasks/${id}`, { method: "DELETE" });
    if (r.ok) {
      setTasks((v) => v.filter((t) => t.id !== id));
      if (editing === id) {
        setEditing(null);
        setTitle("");
        setNotes("");
      }
    } else setError(r.message);
    setBusy(false);
  }
  const visible = tasks.filter(
    (t) =>
      filter === "all" ||
      (filter === "open" && !t.done) ||
      (filter === "done" && t.done) ||
      (filter === "today" && t.due_date === localToday()),
  );
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title={calendar ? "Study calendar" : "Study planner"}
      description="Plan learning, practice, revision and tests. Your changes are saved to your account."
      showNotice={false}
    >
      {error && (
        <p role="alert" className="tile p-4">
          {error}{" "}
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="tile space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{calendar ? "Agenda" : "Your tasks"}</h2>
            <select
              aria-label="Filter tasks"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border bg-background p-2"
            >
              <option value="all">All tasks</option>
              <option value="today">Today</option>
              <option value="open">Incomplete</option>
              <option value="done">Completed</option>
            </select>
          </div>
          <p className="text-sm text-muted-foreground">
            {visible.filter((t) => t.done).length}/{visible.length} completed ·{" "}
            {visible.reduce((n, t) => n + t.minutes, 0)} planned minutes
          </p>
          {!loaded && !error && <p role="status">Loading planner…</p>}
          {loaded && !visible.length && <p>No tasks in this view. Add one to get started.</p>}
          {visible.map((t) => (
            <article key={t.id} className="space-y-2 rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  aria-label={`Complete ${t.title}`}
                  checked={t.done}
                  disabled={busy}
                  onChange={() => toggle(t)}
                />
                <div className="flex-1">
                  <h3 className={t.done ? "font-semibold line-through" : "font-semibold"}>
                    {t.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t.due_date} · {t.category} · {t.minutes} min
                  </p>
                  {t.notes && <p className="mt-2 whitespace-pre-wrap text-sm">{t.notes}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(t.id);
                    setTitle(t.title);
                    setNotes(t.notes ?? "");
                    setDate(t.due_date);
                    setMinutes(t.minutes);
                    setCategory(t.category);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => remove(t.id)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </section>
        <form onSubmit={save} className="tile h-fit space-y-4 p-5">
          <h2 className="text-xl font-bold">{editing ? "Edit task" : "Add task"}</h2>
          <label className="block">
            Title
            <Input
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block">
            Date
            <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block">
            Minutes
            <Input
              required
              type="number"
              min={1}
              max={600}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </label>
          <label className="block">
            Activity
            <select
              className="ml-3 rounded-lg border bg-background p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["Learn", "Practice", "Revise", "Test"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            Notes
            <Textarea maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div className="flex gap-3">
            <Button disabled={busy}>{busy ? "Saving…" : "Save task"}</Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setTitle("");
                  setNotes("");
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </PortalPage>
  );
}
