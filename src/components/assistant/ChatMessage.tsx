import { memo, useState } from "react";
import { Check, Copy, RefreshCcw, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clockTime } from "@/data/notification-center";
import type { AssistantFeedback, AssistantMessage } from "@/data/ai-assistant";
import { cn } from "@/lib/utils";
import { AssistantMark } from "./AssistantMark";
import { MessageText } from "./MessageText";

interface ChatMessageProps {
  message: AssistantMessage;
  onRate?: (feedback: AssistantFeedback) => void;
  onRegenerate?: () => void;
  compact?: boolean;
}

/** One chat bubble with the full assistant action row. */
export const ChatMessage = memo(function ChatMessage({
  message,
  onRate,
  onRegenerate,
  compact,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      toast.success("Response copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy is blocked in this browser");
    }
  };

  const share = async () => {
    const shareData = { title: "YourCBSE — Cue", text: message.text };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user dismissed — fall through to copy */
      }
    }
    await copy();
  };

  return (
    <article
      className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
      aria-label={isUser ? "Your message" : "Assistant response"}
    >
      {!isUser ? <AssistantMark size={28} className="mt-1 rounded-xl" label="" /> : null}

      <div className={cn("min-w-0", compact ? "max-w-[88%]" : "max-w-[85%]")}>
        <div
          className={cn(
            "yc-reveal rounded-3xl px-4 py-3",
            isUser
              ? "rounded-br-lg bg-primary text-primary-foreground"
              : "rounded-bl-lg bg-muted text-foreground",
          )}
          data-revealed="true"
        >
          <MessageText
            text={message.text}
            className={isUser ? "[&_code]:bg-primary-foreground/15 [&_strong]:text-inherit" : undefined}
          />
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-1",
            isUser ? "justify-end" : "justify-start flex-wrap",
          )}
        >
          <time
            dateTime={message.createdAt}
            className="px-1 text-[11px] text-muted-foreground tabular-nums"
          >
            {clockTime(message.createdAt)}
          </time>

          {!isUser ? (
            <>
              <IconAction label={copied ? "Copied" : "Copy response"} onClick={copy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </IconAction>
              <IconAction
                label="Like response"
                pressed={message.feedback === "like"}
                onClick={() => onRate?.("like")}
              >
                <ThumbsUp className="size-3.5" />
              </IconAction>
              <IconAction
                label="Dislike response"
                pressed={message.feedback === "dislike"}
                onClick={() => onRate?.("dislike")}
              >
                <ThumbsDown className="size-3.5" />
              </IconAction>
              <IconAction label="Regenerate response" onClick={() => onRegenerate?.()}>
                <RefreshCcw className="size-3.5" />
              </IconAction>
              <IconAction label="Share response" onClick={share}>
                <Share2 className="size-3.5" />
              </IconAction>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
});

function IconAction({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick?: () => void;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "size-7 rounded-xl text-muted-foreground hover:text-foreground",
        pressed && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </Button>
  );
}
