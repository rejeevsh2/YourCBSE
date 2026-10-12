import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { apiRequest } from "@/lib/auth/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
type Question = { question_text: string; explanation: string; options: string[]; correct: number };
const blank = (): Question => ({
  question_text: "",
  explanation: "",
  options: ["", "", "", ""],
  correct: 0,
});
type Data = {
  sets: { id: number; title: string; is_published: boolean; questions_count: number }[];
  subjects: { id: number; name: string; grade?: { name: string } }[];
};
export const Route = createFileRoute("/admin/question-bank")({ component: QuestionBank });
function QuestionBank() {
  const [data, setData] = useState<Data | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([blank()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const r = await apiRequest<Data>("/admin/practice-sets", { method: "GET" });
    if (r.ok && r.data) setData(r.data);
    else setError(r.message);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  function change(i: number, patch: Partial<Question>) {
    setQuestions((q) => q.map((v, j) => (i === j ? { ...v, ...patch } : v)));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await apiRequest("/admin/practice-sets", {
      body: { title, subject_id: Number(subject), is_published: false, questions },
    });
    if (r.ok) {
      setTitle("");
      setQuestions([blank()]);
      await load();
    } else setError(r.message);
    setBusy(false);
  }
  async function publish(id: number, next: boolean) {
    setBusy(true);
    const r = await apiRequest(`/admin/practice-sets/${id}`, {
      method: "PATCH",
      body: { is_published: next },
    });
    if (r.ok) await load();
    else setError(r.message);
    setBusy(false);
  }
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Question bank & practice sets"
      description="Create multiple-choice practice, then publish it for students."
      showNotice={false}
    >
      {error && (
        <p role="alert" className="tile p-4 text-destructive">
          {error}
        </p>
      )}
      <section className="tile space-y-3 p-5">
        <h2 className="text-xl font-bold">Practice sets</h2>
        {!data ? (
          <p>Loading…</p>
        ) : data.sets.length ? (
          data.sets.map((s) => (
            <div key={s.id} className="flex flex-wrap justify-between gap-3 border-b py-3">
              <span>
                {s.title} · {s.questions_count} questions · {s.is_published ? "Published" : "Draft"}
              </span>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() => publish(s.id, !s.is_published)}
              >
                {s.is_published ? "Unpublish" : "Publish"}
              </Button>
            </div>
          ))
        ) : (
          <p>No practice sets yet.</p>
        )}
      </section>
      <form onSubmit={save} className="tile space-y-5 p-6">
        <h2 className="text-xl font-bold">New practice set</h2>
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
          Subject
          <select
            required
            className="ml-3 rounded-lg border bg-background p-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Choose subject</option>
            {data?.subjects.map((s) => (
              <option value={s.id} key={s.id}>
                {s.grade?.name} · {s.name}
              </option>
            ))}
          </select>
        </label>
        {questions.map((q, i) => (
          <fieldset className="space-y-3 rounded-xl border p-4" key={i}>
            <legend>Question {i + 1}</legend>
            <Textarea
              required
              aria-label={`Question ${i + 1}`}
              value={q.question_text}
              onChange={(e) => change(i, { question_text: e.target.value })}
            />
            {q.options.map((v, j) => (
              <label className="flex items-center gap-3" key={j}>
                <input
                  type="radio"
                  name={`correct-${i}`}
                  checked={q.correct === j}
                  onChange={() => change(i, { correct: j })}
                  aria-label={`Option ${j + 1} is correct`}
                />
                <Input
                  required
                  aria-label={`Option ${j + 1}`}
                  value={v}
                  onChange={(e) =>
                    change(i, { options: q.options.map((o, k) => (j === k ? e.target.value : o)) })
                  }
                />
              </label>
            ))}
            <p className="text-sm text-muted-foreground">
              Select the circle beside the correct answer.
            </p>
            <Textarea
              placeholder="Explanation shown after submission"
              value={q.explanation}
              onChange={(e) => change(i, { explanation: e.target.value })}
            />
            {questions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setQuestions((v) => v.filter((_, j) => j !== i))}
              >
                Remove question
              </Button>
            )}
          </fieldset>
        ))}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={questions.length >= 100}
            onClick={() => setQuestions((q) => [...q, blank()])}
          >
            Add question
          </Button>
          <Button disabled={busy}>{busy ? "Saving…" : "Save draft"}</Button>
        </div>
      </form>
    </PortalPage>
  );
}
