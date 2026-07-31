import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Download,
  Maximize2,
  NotebookPen,
  Printer,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ToolProps {
  label: string;
  icon: typeof Bookmark;
  onClick: () => void;
  active?: boolean;
}

function ToolButton({ label, icon: Icon, onClick, active }: ToolProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "default" : "secondary"}
          size="icon"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "size-11 rounded-full shadow-lg transition-transform duration-200 hover:scale-105",
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Floating utility rail: notes, bookmark, share, fullscreen, print, download. UI only. */
export function FloatingToolbar({ onFullscreen }: { onFullscreen?: () => void }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="pointer-events-none fixed right-3 bottom-3 z-40 flex flex-col items-end gap-3 sm:right-5 sm:bottom-5">
        {notesOpen ? (
          <section
            aria-label="Quick notes"
            className="pointer-events-auto w-[min(20rem,calc(100vw-1.5rem))] animate-in space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xl duration-200 fade-in slide-in-from-bottom-2"
          >
            <header className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-bold text-foreground">Your notes</h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close notes"
                onClick={() => setNotesOpen(false)}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </header>
            <Textarea
              rows={5}
              placeholder="Jot down a quick note for this lesson…"
              aria-label="Lesson note"
              className="rounded-xl"
            />
            <Button
              size="sm"
              className="w-full rounded-xl"
              onClick={() => toast.success("Note saved locally (preview only)")}
            >
              Save note
            </Button>
          </section>
        ) : null}

        <div className="pointer-events-auto grid grid-cols-3 gap-2 sm:grid-cols-1">
          <ToolButton
            label={notesOpen ? "Hide notes" : "Open notes"}
            icon={NotebookPen}
            active={notesOpen}
            onClick={() => setNotesOpen((value) => !value)}
          />
          <ToolButton
            label={bookmarked ? "Remove bookmark" : "Bookmark this lesson"}
            icon={bookmarked ? BookmarkCheck : Bookmark}
            active={bookmarked}
            onClick={() => {
              setBookmarked((value) => !value);
              toast.success(bookmarked ? "Bookmark removed" : "Lesson bookmarked");
            }}
          />
          <ToolButton
            label="Share chapter"
            icon={Share2}
            onClick={() => toast.info("Sharing options coming soon")}
          />
          <ToolButton
            label="Fullscreen learning mode"
            icon={Maximize2}
            onClick={() => onFullscreen?.() ?? toast.info("Fullscreen coming soon")}
          />
          <ToolButton
            label="Print notes"
            icon={Printer}
            onClick={() => toast.info("Print layout coming soon")}
          />
          <ToolButton
            label="Download PDF"
            icon={Download}
            onClick={() => toast.info("PDF download coming soon")}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
