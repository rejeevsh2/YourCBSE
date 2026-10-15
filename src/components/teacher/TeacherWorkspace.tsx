import { useCallback, useEffect, useState } from "react";
import { PortalPage } from "@/components/layout/PortalPage";
import { apiRequest } from "@/lib/auth/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TeacherLessonPreview,
  type TeacherLessonContent,
} from "@/components/teacher/TeacherLessonPreview";

type Lesson = {
  id: number;
  chapter_id: number;
  title: string;
  summary: string;
  duration: number | null;
  is_published: boolean;
  contents: TeacherLessonContent[];
};
type Chapter = {
  id: number;
  title: string;
  unit?: { subject?: { name: string; grade?: { name: string } } };
};
export function TeacherWorkspace({ filter }: { filter?: "draft" | "published" }) {
  const requestedChapterId =
    Number(
      new URLSearchParams(
        window.location.search,
      ).get("chapterId"),
    ) || 0;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [contentTitle, setContentTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("text");
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      apiRequest<{ lessons: Lesson[] }>("/teacher/lessons", { method: "GET" }),
      apiRequest<{ chapters: Chapter[] }>("/teacher/chapters", { method: "GET" }),
    ]);
    if (a.ok && a.data && b.ok && b.data) {
      setLessons(a.data.lessons);
      setChapters(b.data.chapters);
      setLoaded(true);
    } else setError(!a.ok ? a.message : b.message);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  function choose(l: Lesson | null) {
    setSelected(l);
    setTitle(l?.title ?? "");
    setSummary(l?.summary ?? "");

    if (!l && requestedChapterId) {
      setChapterId(
        String(requestedChapterId),
      );
    }

    setError("");
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await apiRequest<{ lesson: Lesson }>(
      selected ? `/teacher/lessons/${selected.id}` : "/teacher/lessons",
      {
        method: selected ? "PUT" : "POST",
        body: { title, summary, chapter_id: Number(chapterId) },
      },
    );
    if (r.ok && r.data) {
      choose(r.data.lesson);
      await load();
    } else setError(r.message);
    setBusy(false);
  }
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    const r = await apiRequest<{ lesson: Lesson }>(`/teacher/lessons/${selected.id}/contents`, {
      body: {
        title: contentTitle,
        content_type: type,
        content: content || null,
        external_url: url || null,
      },
    });
    if (r.ok && r.data) {
      setSelected(r.data.lesson);
      setContent("");
      setContentTitle("");
      setUrl("");
      await load();
    } else setError(r.message);
    setBusy(false);
  }
  async function remove(id: number) {
    if (!selected) return;
    setBusy(true);
    const r = await apiRequest<{ lesson: Lesson }>(
      `/teacher/lessons/${selected.id}/contents/${id}`,
      { method: "DELETE" },
    );
    if (r.ok && r.data) {
      setSelected(r.data.lesson);
      await load();
    } else setError(r.message);
    setBusy(false);
  }
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Lesson workspace"
      description="Create lessons and resources. An administrator reviews and publishes your drafts."
      showNotice={false}
    >
      {error && (
        <p role="alert" className="tile p-4 text-destructive">
          {error}{" "}
          <Button onClick={load} variant="outline">
            Retry
          </Button>
        </p>
      )}
      {!loaded && !error && <p role="status">Loading your lessons…</p>}
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <section className="tile space-y-3 p-5">
          <Button variant="outline" onClick={() => choose(null)}>
            New lesson
          </Button>
          {lessons
            .filter(
              (l) =>
                (!requestedChapterId ||
                  l.chapter_id === requestedChapterId) &&
                (!filter ||
                  (filter === "published"
                    ? l.is_published
                    : !l.is_published)),
            )
            .map((l) => (
              <button
                key={l.id}
                className="block w-full rounded-lg border p-3 text-left"
                onClick={() => choose(l)}
              >
                {l.title}
                <small className="block text-muted-foreground">
                  {l.is_published ? "Published" : "Draft"}
                </small>
              </button>
            ))}
          {loaded && !lessons.length && <p>No lessons yet.</p>}
        </section>
        <section className="tile space-y-5 p-6">
          <form className="space-y-4" onSubmit={save}>
            <h2 className="text-xl font-bold">{selected ? "Edit lesson" : "New lesson"}</h2>
            <fieldset disabled={busy || !!selected?.is_published} className="space-y-4">
              {!selected && (
                <label className="block">
                  Chapter
                  <select
                    required
                    value={chapterId}
                    onChange={(e) => setChapterId(e.target.value)}
                    className="mt-1 block w-full rounded-lg border bg-background p-2"
                  >
                    <option value="">Choose a chapter</option>
                    {chapters.map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.unit?.subject?.grade?.name} · {c.unit?.subject?.name} · {c.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
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
                Summary
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
              </label>
              <Button>{busy ? "Saving…" : "Save draft"}</Button>
            </fieldset>
          </form>
          {selected?.is_published && (
            <p>This lesson is published. Ask an administrator to unpublish it before editing.</p>
          )}
          {selected && (
            <>
              <h2 className="text-lg font-bold">Lesson resources</h2>
              {selected.contents.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2">
                  <span>
                    {c.title} · {c.content_type}
                  </span>
                  {!selected.is_published && (
                    <Button variant="ghost" disabled={busy} onClick={() => remove(c.id)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}

              <TeacherLessonPreview
                contents={selected.contents}
              />
              {!selected.is_published && (
                <form onSubmit={add} className="space-y-3">
                  <label className="block">
                    Resource title
                    <Input
                      required
                      value={contentTitle}
                      onChange={(e) => setContentTitle(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    Resource type
                    <select
                      className="ml-3 rounded-lg border bg-background p-2"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      {["text", "video", "pdf", "ppt", "image", "audio", "worksheet", "activity"].map(
                        (t) => (
                          <option key={t}>{t}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="block">
                    Content
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
                  </label>
                  <label className="block">
                    Resource URL
                    <Input
                      type="url"
                      placeholder="https://…"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </label>
                  <Button disabled={busy || (!content.trim() && !url.trim())}>Add resource</Button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </PortalPage>
  );
}
