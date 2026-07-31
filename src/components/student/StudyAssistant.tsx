import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { assistantSkills, assistantTranscript } from "@/data/student";

/** Placeholder AI study assistant surface — no model calls, UI only. */
export function StudyAssistant({ className }: { className?: string }) {
  const [draft, setDraft] = useState("");

  return (
    <section className={cn("tile flex h-full flex-col overflow-hidden p-0", className)}>
      <header className="flex items-center gap-3 border-b border-border p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-base font-bold">Study Assistant</h2>
          <p className="text-xs text-muted-foreground">Tuned to the CBSE Class 10 syllabus</p>
        </div>
        <Badge variant="secondary" className="rounded-full text-[11px]">
          Preview
        </Badge>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {assistantTranscript.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <p
              className={cn(
                "max-w-[85%] rounded-3xl px-4 py-3 text-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-border p-5">
        <div className="flex flex-wrap gap-2">
          {assistantSkills.slice(0, 4).map((skill) => (
            <Button
              key={skill.id}
              type="button"
              size="sm"
              variant="outline"
              className="rounded-2xl text-xs"
              onClick={() => setDraft(skill.prompt)}
            >
              {skill.title}
            </Button>
          ))}
        </div>

        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask anything from your syllabus…"
            aria-label="Message the study assistant"
            className="min-h-16 resize-none rounded-2xl"
          />
          <Button type="button" size="icon" className="size-11 shrink-0 rounded-2xl" aria-label="Send message">
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Responses are placeholders in this preview build.
        </p>
      </div>
    </section>
  );
}
