import { Bookmark, CheckCircle2, Download, FileText, Lock, PlayCircle, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  chapter,
  chapterBookmarks,
  chapterDownloads,
  chapterLessons,
  chapterNotes,
  chapterResources,
  type ChapterLesson,
} from "@/data/chapter";
import { cn } from "@/lib/utils";

function LessonRow({ lesson }: { lesson: ChapterLesson }) {
  const locked = lesson.status === "locked";
  const Icon =
    lesson.status === "completed" ? CheckCircle2 : lesson.status === "locked" ? Lock : PlayCircle;

  return (
    <li>
      <button
        type="button"
        disabled={locked}
        aria-current={lesson.status === "current" ? "step" : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          locked
            ? "cursor-not-allowed opacity-55"
            : "hover:bg-accent hover:text-accent-foreground",
          lesson.status === "current" && "bg-primary/10 text-foreground ring-1 ring-primary/30",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            lesson.status === "completed"
              ? "text-success"
              : lesson.status === "current"
                ? "text-primary"
                : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{lesson.title}</span>
          <span className="block text-xs text-muted-foreground">
            {lesson.duration}
            {lesson.status === "completed" ? " · Completed" : null}
            {locked ? " · Locked" : null}
          </span>
        </span>
      </button>
    </li>
  );
}

function MiniList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof Bookmark;
  items: { id: string; label: string; meta: string }[];
}) {
  return (
    <section aria-label={title} className="space-y-2">
      <h3 className="flex items-center gap-2 px-3 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden="true" />
        {title}
      </h3>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="block truncate text-sm font-medium">{item.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.meta}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Sticky chapter navigation rail. Presentation only. */
export function ChapterSidebar({ onClose }: { onClose?: () => void }) {
  const completed = chapterLessons.filter((lesson) => lesson.status === "completed").length;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              {chapter.course}
            </p>
            <p className="truncate text-sm font-medium text-muted-foreground">
              {chapter.grade} · {chapter.subject}
            </p>
            <h2 className="font-heading text-lg font-bold text-foreground">{chapter.title}</h2>
          </div>
          {onClose ? (
            <Button variant="ghost" size="icon" aria-label="Close chapter menu" onClick={onClose}>
              <X className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Chapter progress</span>
            <span className="font-semibold text-primary">{chapter.progress}%</span>
          </div>
          <Progress value={chapter.progress} aria-label="Chapter progress" />
          <p className="text-xs text-muted-foreground">
            {completed} of {chapterLessons.length} lessons complete · {chapter.estimatedCompletion}
          </p>
        </div>
      </div>

      <nav
        aria-label="Chapter navigation"
        className="flex-1 space-y-5 overflow-y-auto p-2 pb-6"
      >
        <section aria-label="Lessons" className="space-y-2">
          <h3 className="px-3 pt-1 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Lessons
          </h3>
          <ul className="space-y-0.5">
            {chapterLessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </ul>
        </section>

        <Separator />
        <MiniList title="Bookmarks" icon={Bookmark} items={chapterBookmarks} />
        <Separator />
        <MiniList title="Downloads" icon={Download} items={chapterDownloads} />
        <Separator />
        <MiniList title="Notes" icon={FileText} items={chapterNotes} />
        <Separator />
        <MiniList title="Resources" icon={FileText} items={chapterResources} />
      </nav>

      <div className="border-t border-border p-3">
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link to="/resources">Open resource library</Link>
        </Button>
      </div>
    </div>
  );
}

