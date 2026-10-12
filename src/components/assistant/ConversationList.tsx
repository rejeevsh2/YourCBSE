import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AssistantConversation } from "@/data/ai-assistant";
import { relativeTime } from "@/data/notification-center";
import { cn } from "@/lib/utils";
import { EmptyHistory } from "./AssistantStates";

interface ConversationListProps {
  conversations: AssistantConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onNewChat: () => void;
  className?: string;
}

/** Conversation history rail — used by the workspace and the floating panel. */
export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
  className,
}: ConversationListProps) {
  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <Button type="button" onClick={onNewChat} className="w-full rounded-2xl">
        <MessageSquarePlus className="size-4" /> New chat
      </Button>

      {conversations.length === 0 ? (
        <EmptyHistory onStart={onNewChat} />
      ) : (
        <ScrollArea className="min-h-0 flex-1 pr-2">
          <ul className="space-y-2" aria-label="Conversation history">
            {conversations.map((conversation) => {
              const active = conversation.id === activeId;
              return (
                <li
                  key={conversation.id}
                  className={cn(
                    "group flex items-start gap-2 rounded-2xl border border-transparent px-3 py-2.5 transition-colors hover:bg-accent/60",
                    active && "border-primary/25 bg-accent text-accent-foreground",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={active ? "true" : undefined}
                    className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <span className="block truncate text-sm font-medium">{conversation.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {conversation.preview}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {relativeTime(conversation.updatedAt)}
                    </span>
                  </button>

                  {onDelete ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete conversation ${conversation.title}`}
                      onClick={() => onDelete(conversation.id)}
                      className="size-7 shrink-0 rounded-xl text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}

