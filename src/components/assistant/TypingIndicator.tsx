import { AssistantMark } from "./AssistantMark";

/** Animated "Cue is thinking" indicator. */
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" role="status" aria-live="polite">
      <AssistantMark size={28} className="rounded-xl" label="" />
      <span className="sr-only">Cue is typing a response</span>
      <span className="flex items-center gap-1 rounded-3xl rounded-bl-lg bg-muted px-4 py-3">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden="true"
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
            style={{ animationDelay: `${index * 140}ms`, animationDuration: "900ms" }}
          />
        ))}
      </span>
    </div>
  );
}
