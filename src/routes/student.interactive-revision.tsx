import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { StatGrid } from "@/components/common/StatCard";
import { apiRequest } from "@/lib/auth/http";

type Session = {
  id: number;
  status: string;
  total_cards: number;
  completed_cards: number;
  score: number;
  reviewed_ids: number[] | null;
  started_at: string;
};
type Card = { id: number; title: string; content: string; lesson_id: number };
type SessionData = { session: Session; cards: Card[] };
type Home = { due: number; recall_accuracy: number; sessions: Session[] };
export const Route = createFileRoute("/student/interactive-revision")({
  head: () => ({
    meta: [
      { title: "Interactive Revision — YourSchool" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RevisionPage,
});
function RevisionPage() {
  const [home, setHome] = useState<Home | null>(null);
  const [active, setActive] = useState<SessionData | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const r = await apiRequest<Home>("/interactive-revision", { method: "GET" });
    if (r.ok && r.data) setHome(r.data);
    else setError(r.message);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function open(id?: number) {
    setBusy(true);
    setError("");
    const r = await apiRequest<SessionData>(
      id ? `/interactive-revision/${id}` : "/interactive-revision/start",
      { method: id ? "GET" : "POST" },
    );
    if (r.ok && r.data) {
      setActive(r.data);
      setRevealed(false);
    } else setError(r.message);
    setBusy(false);
  }
  const card = active?.cards.find((c) => !(active.session.reviewed_ids ?? []).includes(c.id));
  async function rate(rating: string) {
    if (!active || !card || busy) return;
    setBusy(true);
    setError("");
    const r = await apiRequest<SessionData>(`/interactive-revision/${active.session.id}/review`, {
      body: { card_id: card.id, rating },
    });
    if (r.ok && r.data) {
      setActive(r.data);
      setRevealed(false);
    } else setError(r.message);
    setBusy(false);
  }
  async function finish() {
    if (!active) return;
    setBusy(true);
    const r = await apiRequest(`/interactive-revision/${active.session.id}/finish`);
    if (r.ok) {
      setActive(null);
      await load();
    } else setError(r.message);
    setBusy(false);
  }
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Interactive revision"
      description="Recall an answer, reveal it, and choose when to practise it again."
      showNotice={false}
    >
      {error && (
        <div role="alert" className="rounded-xl border border-destructive p-4">
          {error}{" "}
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </div>
      )}
      {!home && !error && <p role="status">Loading revision…</p>}
      {home && (
        <StatGrid
          items={[
            { label: "Cards due", value: String(home.due), tone: "warning" },
            { label: "Recent sessions", value: String(home.sessions.length), tone: "primary" },
            { label: "Recall accuracy", value: `${home.recall_accuracy}%`, tone: "success" },
          ]}
        />
      )}
      {active ? (
        <section className="tile space-y-5 p-6" aria-live="polite">
          <p className="text-sm text-muted-foreground">
            {active.session.completed_cards} of {active.session.total_cards} cards reviewed
          </p>
          {card ? (
            <>
              <h2 className="text-2xl font-bold">{card.title}</h2>
              {revealed ? (
                <>
                  <p className="whitespace-pre-wrap rounded-xl bg-muted p-5">{card.content}</p>
                  <div className="flex flex-wrap gap-3">
                    {["again", "hard", "good", "easy"].map((r) => (
                      <Button
                        key={r}
                        disabled={busy}
                        onClick={() => rate(r)}
                        variant="outline"
                        className="capitalize"
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <Button onClick={() => setRevealed(true)}>Show answer</Button>
              )}
              <Link
                className="block text-sm text-primary underline"
                to="/student/lesson/$lessonId"
                params={{ lessonId: String(card.lesson_id) }}
              >
                Review lesson
              </Link>
            </>
          ) : (
            <h2 className="text-xl font-bold">All available cards reviewed. Well done!</h2>
          )}
          <Button variant="secondary" disabled={busy} onClick={finish}>
            {card ? "Finish session early" : "Finish session"}
          </Button>
        </section>
      ) : (
        <section className="tile space-y-4 p-6">
          <h2 className="text-xl font-bold">Your next revision session</h2>
          <p>Add question-and-answer cards from a lesson page. New and due cards appear here.</p>
          <Button disabled={busy || !home} onClick={() => open()}>
            {home?.sessions.some((s) => s.status === "active")
              ? "Continue session"
              : "Start session"}
          </Button>
          <Button asChild variant="outline" className="ml-3">
            <Link to="/student/learning-hub">Browse lessons</Link>
          </Button>
        </section>
      )}
      {!!home?.sessions.length && (
        <section className="tile space-y-3 p-6">
          <h2 className="text-lg font-bold">Recent sessions</h2>
          {home.sessions.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b py-3"
            >
              <span>
                {new Date(s.started_at).toLocaleDateString()} · {s.completed_cards}/{s.total_cards}{" "}
                reviewed · {s.score} recalled
              </span>
              <span>
                {s.status === "active" ? (
                  <Button disabled={busy} variant="outline" onClick={() => open(s.id)}>
                    Continue
                  </Button>
                ) : (
                  "Completed"
                )}
              </span>
            </div>
          ))}
        </section>
      )}
    </PortalPage>
  );
}
