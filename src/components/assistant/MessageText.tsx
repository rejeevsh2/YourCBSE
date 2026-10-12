import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Tiny markdown renderer for assistant replies (bold, inline code, lists,
 * numbered steps, italics). Dependency-free so the chat stays lightweight.
 */
export function MessageText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");

  return (
    <div className={cn("space-y-2 text-sm leading-relaxed", className)}>
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" aria-hidden="true" />;

        const bullet = /^[-•]\s+(.*)$/.exec(line);
        if (bullet) {
          return (
            <p key={index} className="flex gap-2">
              <span aria-hidden="true" className="text-primary">
                •
              </span>
              <span>{renderInline(bullet[1])}</span>
            </p>
          );
        }

        const numbered = /^(\d+)\.\s+(.*)$/.exec(line);
        if (numbered) {
          return (
            <p key={index} className="flex gap-2">
              <span className="font-semibold text-primary">{numbered[1]}.</span>
              <span>{renderInline(numbered[2])}</span>
            </p>
          );
        }

        return <p key={index}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g;

function renderInline(value: string) {
  const parts = value.split(TOKEN).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return (
        <em key={index} className="text-muted-foreground">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

