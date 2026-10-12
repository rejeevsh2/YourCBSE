import { forwardRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { CornerDownLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  onSend: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Prefills the textarea when a quick action is picked. */
  value?: string;
  onValueChange?: (value: string) => void;
}

/** Accessible chat composer: Enter sends, Shift+Enter adds a line. */
export const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(
  function ChatComposer(
    { onSend, disabled, placeholder = "Ask anything from your syllabus…", className, value, onValueChange },
    ref,
  ) {
    const [internal, setInternal] = useState("");
    const draft = value ?? internal;

    const setDraft = (next: string) => {
      if (onValueChange) onValueChange(next);
      else setInternal(next);
    };

    const submit = (event?: FormEvent) => {
      event?.preventDefault();
      const text = draft.trim();
      if (!text || disabled) return;
      onSend(text);
      setDraft("");
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    };

    return (
      <form onSubmit={submit} className={cn("space-y-2", className)}>
        <div className="flex items-end gap-2">
          <Textarea
            ref={ref}
            rows={2}
            value={draft}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Message the study assistant"
            className="min-h-16 resize-none rounded-2xl"
          />
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !draft.trim()}
            className="size-11 shrink-0 rounded-2xl"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CornerDownLeft className="size-3" aria-hidden="true" />
          Enter to send · Shift + Enter for a new line · responses are placeholders in this preview.
        </p>
      </form>
    );
  },
);

