import { CloudOff, MessageSquarePlus, RefreshCcw, Sparkle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateView } from "@/components/common/StateViews";
import type { AssistantError } from "@/lib/assistant";
import { AssistantMark } from "./AssistantMark";

/** Skeleton transcript while conversations load. */
export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-5" aria-busy="true" aria-live="polite">
      {[0, 1, 2].map((row) => (
        <div key={row} className={row % 2 ? "flex justify-end" : "flex gap-2"}>
          {row % 2 === 0 ? <Skeleton className="size-7 shrink-0 rounded-xl" /> : null}
          <div className="w-2/3 space-y-2">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-4/5 rounded-full" />
            <Skeleton className="h-4 w-1/2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecommendationSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="tile space-y-3 p-5">
          <Skeleton className="size-10 rounded-2xl" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-4/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function AnalyticsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="tile space-y-3 p-5">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-xl" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** No conversation history yet. */
export function EmptyHistory({ onStart }: { onStart?: () => void }) {
  return (
    <StateView
      icon={<MessageSquarePlus className="size-6" />}
      title="No chats yet"
      description="Your conversations with Cue will be listed here so you can pick up any topic again."
      className="py-10"
    >
      {onStart ? (
        <Button className="rounded-2xl" onClick={onStart}>
          Start a chat
        </Button>
      ) : null}
    </StateView>
  );
}

export function EmptyRecommendations() {
  return (
    <StateView
      icon={<Sparkle className="size-6" />}
      title="No recommendations yet"
      description="Finish a lesson or a practice set and Cue will start suggesting what to do next."
      className="py-12"
    />
  );
}

/** Connection / provider failures, mapped from the service error code. */
export function AssistantErrorState({
  error,
  onRetry,
}: {
  error: AssistantError;
  onRetry?: () => void;
}) {
  const copy = {
    offline: {
      icon: <WifiOff className="size-6" />,
      title: "Connection lost",
      description: "You appear to be offline. Reconnect and Cue will pick up right where you left off.",
      tone: "warning" as const,
    },
    unavailable: {
      icon: <CloudOff className="size-6" />,
      title: "AI unavailable",
      description: "Cue is temporarily unreachable. Your chat history is safe — try again in a moment.",
      tone: "warning" as const,
    },
    failed: {
      icon: <RefreshCcw className="size-6" />,
      title: "Failed response",
      description: "That response could not be generated. Regenerate it or rephrase your question.",
      tone: "destructive" as const,
    },
  }[error.code];

  return (
    <StateView
      icon={copy.icon}
      title={copy.title}
      description={error.message || copy.description}
      tone={copy.tone}
      className="py-12"
    >
      {onRetry ? (
        <Button variant="outline" className="rounded-2xl" onClick={onRetry}>
          <RefreshCcw className="size-4" /> Try again
        </Button>
      ) : null}
    </StateView>
  );
}

/** Friendly first-run state inside an empty transcript. */
export function AssistantWelcome() {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <AssistantMark size={56} className="rounded-3xl" />
      <h3 className="mt-4 font-heading text-base font-bold">Say hello to Cue</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Your CBSE study buddy. Ask a doubt, generate a quiz or summarise a chapter in seconds.
      </p>
    </div>
  );
}

