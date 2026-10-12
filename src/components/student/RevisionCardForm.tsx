import { useState } from "react";
import { apiRequest } from "@/lib/auth/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
export function RevisionCardForm({ lessonId }: { lessonId: string | number }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <details className="tile p-5">
      <summary className="cursor-pointer font-semibold">Add a personal revision card</summary>
      <form
        className="mt-4 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage("");
          const r = await apiRequest(`/lessons/${lessonId}/revision-cards`, {
            body: { title, content },
          });
          setMessage(r.ok ? "Card saved. Open Interactive Revision to practise it." : r.message);
          if (r.ok) {
            setTitle("");
            setContent("");
          }
          setBusy(false);
        }}
      >
        <label className="block">
          Question
          <Input
            required
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block">
          Answer
          <Textarea
            required
            maxLength={10000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <Button disabled={busy}>{busy ? "Saving…" : "Save revision card"}</Button>
        <p role="status">{message}</p>
      </form>
    </details>
  );
}
