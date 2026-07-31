import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiChat } from "@/hooks/use-ai-chat";
import { cn } from "@/lib/utils";
import { AssistantChat } from "./AssistantChat";
import { AssistantMark } from "./AssistantMark";

/**
 * Floating assistant launcher available on every student page.
 * Open with the button or ⌘/Ctrl + J, close with Escape.
 */
export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const chat = useAiChat({ enabled: open });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setOpen((value) => !value);
        setCollapsed(false);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {open ? (
        <div
          role="dialog"
          aria-label="AI study assistant"
          className={cn(
            "yc-reveal fixed right-3 bottom-3 z-50 flex flex-col sm:right-6 sm:bottom-24",
            collapsed
              ? "w-[min(20rem,calc(100vw-1.5rem))]"
              : expanded
                ? "h-[min(46rem,calc(100vh-2rem))] w-[min(46rem,calc(100vw-1.5rem))]"
                : "h-[min(34rem,calc(100vh-2rem))] w-[min(24rem,calc(100vw-1.5rem))]",
          )}
          data-revealed="true"
        >
          {collapsed ? (
            <div className="tile flex items-center gap-3 p-3">
              <AssistantMark size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-bold">Cue · Study Assistant</p>
                <p className="truncate text-xs text-muted-foreground">Collapsed — tap to continue</p>
              </div>
              <Button size="sm" className="rounded-2xl" onClick={() => setCollapsed(false)}>
                Expand
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-xl"
                aria-label="Close assistant"
                onClick={() => setOpen(false)}
              >
                ×
              </Button>
            </div>
          ) : (
            <AssistantChat
              chat={chat}
              compact={!expanded}
              expanded={expanded}
              onClose={() => setOpen(false)}
              onCollapse={() => setCollapsed(true)}
              onToggleExpand={() => setExpanded((value) => !value)}
              className="shadow-[var(--shadow-glow)]"
            />
          )}
        </div>
      ) : null}

      <Button
        type="button"
        onClick={() => {
          setOpen(true);
          setCollapsed(false);
        }}
        aria-expanded={open}
        aria-label="Open the AI study assistant (Ctrl + J)"
        className={cn(
          "fixed right-4 bottom-4 z-40 h-14 rounded-full pr-5 pl-3 shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03] sm:right-6 sm:bottom-6",
          open && "hidden sm:inline-flex",
        )}
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">Ask Cue</span>
      </Button>
    </>
  );
}
