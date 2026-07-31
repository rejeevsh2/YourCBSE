import { useEffect, useRef, useState } from "react";
import {
  Eraser,
  History,
  Maximize2,
  Minimize2,
  MessageSquarePlus,
  Minus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { suggestedQuestions, type AssistantQuickAction } from "@/data/ai-assistant";
import { useAiChat } from "@/hooks/use-ai-chat";
import { cn } from "@/lib/utils";
import { AssistantMark } from "./AssistantMark";
import {
  AssistantErrorState,
  AssistantWelcome,
  ChatSkeleton,
} from "./AssistantStates";
import { ChatComposer } from "./ChatComposer";
import { ChatMessage } from "./ChatMessage";
import { ConversationList } from "./ConversationList";
import { QuickActionBar } from "./QuickActionBar";
import { TypingIndicator } from "./TypingIndicator";

interface AssistantChatProps {
  chat: ReturnType<typeof useAiChat>;
  className?: string;
  /** Header controls, shown only when a handler is supplied. */
  onClose?: () => void;
  onCollapse?: () => void;
  onToggleExpand?: () => void;
  expanded?: boolean;
  /** Show the built-in history drawer toggle (floating panel). */
  showHistoryToggle?: boolean;
  compact?: boolean;
}

/** The reusable chat surface, shared by the floating panel and the workspace. */
export function AssistantChat({
  chat,
  className,
  onClose,
  onCollapse,
  onToggleExpand,
  expanded,
  showHistoryToggle = true,
  compact,
}: AssistantChatProps) {
  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sending, loading, error } = chat;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  const pickAction = (action: AssistantQuickAction) => {
    setDraft(action.prompt);
    composerRef.current?.focus();
  };

  const hasConversation = messages.length > 1;

  return (
    <section
      className={cn("tile flex h-full min-h-0 flex-col overflow-hidden p-0", className)}
      aria-label="AI study assistant chat"
    >
      <header className="flex items-center gap-3 border-b border-border p-4">
        <AssistantMark size={38} />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-sm font-bold">Cue · Study Assistant</h2>
          <p className="truncate text-xs text-muted-foreground">
            {chat.active?.title ?? "Tuned to your CBSE syllabus"}
          </p>
        </div>
        <Badge variant="secondary" className="hidden rounded-full text-[10px] sm:inline-flex">
          Preview
        </Badge>

        <div className="flex items-center gap-0.5">
          {showHistoryToggle ? (
            <HeaderButton
              label="Conversation history"
              pressed={historyOpen}
              onClick={() => setHistoryOpen((value) => !value)}
            >
              <History className="size-4" />
            </HeaderButton>
          ) : null}
          <HeaderButton label="New chat" onClick={() => void chat.startNewChat()}>
            <MessageSquarePlus className="size-4" />
          </HeaderButton>
          <HeaderButton label="Clear chat" onClick={() => void chat.clearChat()}>
            <Eraser className="size-4" />
          </HeaderButton>
          {onToggleExpand ? (
            <HeaderButton label={expanded ? "Restore panel size" : "Expand panel"} onClick={onToggleExpand}>
              {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </HeaderButton>
          ) : null}
          {onCollapse ? (
            <HeaderButton label="Collapse assistant" onClick={onCollapse}>
              <Minus className="size-4" />
            </HeaderButton>
          ) : null}
          {onClose ? (
            <HeaderButton label="Close assistant" onClick={onClose}>
              <X className="size-4" />
            </HeaderButton>
          ) : null}
        </div>
      </header>

      {historyOpen ? (
        <div className="max-h-64 border-b border-border p-3">
          <ConversationList
            conversations={chat.conversations}
            activeId={chat.activeId}
            onSelect={(id) => {
              chat.setActiveId(id);
              setHistoryOpen(false);
            }}
            onDelete={(id) => void chat.deleteConversation(id)}
            onNewChat={() => void chat.startNewChat()}
            className="max-h-56"
          />
        </div>
      ) : null}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? (
          <ChatSkeleton />
        ) : error ? (
          <AssistantErrorState error={error} onRetry={() => void chat.retry()} />
        ) : (
          <div className="space-y-4">
            {!hasConversation ? <AssistantWelcome /> : null}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                compact={compact}
                onRate={(feedback) => void chat.rate(message.id, feedback)}
                onRegenerate={() => void chat.regenerate(message.id)}
              />
            ))}

            {sending ? <TypingIndicator /> : null}

            {!hasConversation ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                  Try asking
                </p>
                <div className="flex flex-col gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void chat.send(question)}
                      className="rounded-2xl border border-border bg-card/60 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <QuickActionBar onSelect={pickAction} limit={compact ? 6 : 12} />
        <ChatComposer
          ref={composerRef}
          value={draft}
          onValueChange={setDraft}
          disabled={sending || loading}
          onSend={(text) => void chat.send(text)}
        />
      </div>
    </section>
  );
}

function HeaderButton({
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
      className={cn("size-8 rounded-xl", pressed && "bg-accent text-accent-foreground")}
    >
      {children}
    </Button>
  );
}
