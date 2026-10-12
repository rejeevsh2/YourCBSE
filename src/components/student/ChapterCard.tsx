import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { BookmarkCheck, Bookmark, Check, Clock3, Download, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { difficultyTone, type LibraryChapter } from "@/data/student-library";

interface ChapterCardProps {
  chapter: LibraryChapter;
  bookmarked: boolean;
  downloaded: boolean;
  onToggleBookmark: (id: string) => void;
  onDownload: (id: string) => void;
}

/** Reusable chapter tile used across the Learning Hub, My Courses and recommendations. */
export const ChapterCard = memo(function ChapterCard({
  chapter,
  bookmarked,
  downloaded,
  onToggleBookmark,
  onDownload,
}: ChapterCardProps) {
  const Icon = chapter.icon;
  const BookmarkIcon = bookmarked ? BookmarkCheck : Bookmark;

  return (
    <article className="tile tile-interactive flex h-full flex-col overflow-hidden p-0">
      <div
        className={cn(
          "relative flex h-28 items-center justify-center bg-gradient-to-br",
          chapter.cover,
        )}
      >
        <Icon className="size-9 text-foreground/70" aria-hidden="true" />
        <Badge
          variant="outline"
          className={cn(
            "absolute top-3 right-3 rounded-full text-[11px]",
            difficultyTone[chapter.difficulty],
          )}
        >
          {chapter.difficulty}
        </Badge>
        {chapter.completion === 100 ? (
          <Badge className="absolute top-3 left-3 gap-1 rounded-full bg-success/15 text-[11px] text-success">
            <Check className="size-3" aria-hidden="true" /> Completed
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs text-muted-foreground">
            {chapter.grade} · {chapter.subject}
          </p>
          <h3 className="font-heading text-base font-bold">
            <Link
              to="/student/chapter/$chapterSlug"
              params={{ chapterSlug: chapter.slug }}
              className="after:absolute after:inset-0 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {chapter.title}
            </Link>
          </h3>
        </div>

        <Progress value={chapter.completion} aria-label={`${chapter.title} completion`} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{chapter.completion}% complete</span>
          <span className="flex items-center gap-1">
            <Clock3 className="size-3.5" aria-hidden="true" /> {chapter.minutes} min
          </span>
        </div>

        <div className="relative z-10 mt-auto flex items-center gap-2">
          <Button asChild size="sm" className="flex-1 rounded-2xl">
            <Link to="/student/chapter/$chapterSlug" params={{ chapterSlug: chapter.slug }}>
              <PlayCircle className="size-4" aria-hidden="true" />
              {chapter.completion > 0 ? "Continue" : "Start"}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-10 min-w-10 rounded-2xl"
            aria-pressed={bookmarked}
            aria-label={bookmarked ? `Remove ${chapter.title} from bookmarks` : `Bookmark ${chapter.title}`}
            onClick={() => onToggleBookmark(chapter.id)}
          >
            <BookmarkIcon className={cn("size-4", bookmarked && "text-primary")} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-10 min-w-10 rounded-2xl"
            aria-label={downloaded ? `${chapter.title} downloaded` : `Download ${chapter.title}`}
            onClick={() => onDownload(chapter.id)}
          >
            {downloaded ? (
              <Check className="size-4 text-success" />
            ) : (
              <Download className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </article>
  );
});

