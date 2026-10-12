import { useState } from "react";
import { apiRequest } from "@/lib/auth/http";
import { PortalPage } from "@/components/layout/PortalPage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export function Announcements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("student");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [review, setReview] = useState(false);
  async function send() {
    setBusy(true);
    setStatus("");
    const r = await apiRequest<{ recipients: number }>("/admin/announcements", {
      body: { title, message, role, link: link || null },
    });
    if (r.ok && r.data) {
      setStatus(`Delivered to ${r.data.recipients} accounts with announcements enabled.`);
      setReview(false);
      setTitle("");
      setMessage("");
      setLink("");
    } else setStatus(r.message);
    setBusy(false);
  }
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Announcements"
      description="Send an in-app update to students or teachers who have announcements enabled."
      showNotice={false}
    >
      {status && (
        <p role="status" className="tile p-5">
          {status}
        </p>
      )}
      {review ? (
        <section className="tile max-w-2xl space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            Recipients: all {role}s with announcements enabled
          </p>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="whitespace-pre-wrap">{message}</p>
          {link && <p>Opens: {link}</p>}
          <div className="flex gap-3">
            <Button disabled={busy} onClick={send}>
              {busy ? "Sending…" : "Send announcement"}
            </Button>
            <Button disabled={busy} variant="outline" onClick={() => setReview(false)}>
              Edit
            </Button>
          </div>
        </section>
      ) : (
        <form
          className="tile max-w-2xl space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setReview(true);
          }}
        >
          <label className="block">
            Audience
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="ml-3 rounded-lg border bg-background p-2"
            >
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </select>
          </label>
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
            Message
            <Textarea
              required
              maxLength={5000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <label className="block">
            Optional website path
            <Input
              placeholder="/student/learning-hub"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
          <Button>Review announcement</Button>
        </form>
      )}
    </PortalPage>
  );
}
