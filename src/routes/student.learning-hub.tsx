import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookMarked, History, Search, SlidersHorizontal } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { ChapterCard } from "@/components/student/ChapterCard";
import { NoResults } from "@/components/common/StateViews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLibraryState } from "@/hooks/use-library-state";
import {
  completionFilters,
  libraryChapters,
  libraryGrades,
  librarySubjects,
  type CompletionFilter,
} from "@/data/student-library";

export const Route = createFileRoute("/student/learning-hub")({
  head: () => ({
    meta: [
      { title: "Learning Hub — YourCBSE" },
      { name: "description", content: "Browse, filter and resume every chapter in your syllabus." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LearningHubPage,
});

function LearningHubPage() {
  const { bookmarks, downloads, toggleBookmark, download } = useLibraryState();
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState(libraryGrades[0]);
  const [subject, setSubject] = useState(librarySubjects[0]);
  const [completion, setCompletion] = useState<CompletionFilter>(completionFilters[0]);
  const [view, setView] = useState<"all" | "recent" | "bookmarks">("all");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return libraryChapters.filter((chapter) => {
      if (term && !`${chapter.title} ${chapter.subject}`.toLowerCase().includes(term)) return false;
      if (grade !== libraryGrades[0] && chapter.grade !== grade) return false;
      if (subject !== librarySubjects[0] && chapter.subject !== subject) return false;
      if (completion === "Not started" && chapter.completion !== 0) return false;
      if (completion === "In progress" && (chapter.completion === 0 || chapter.completion === 100))
        return false;
      if (completion === "Completed" && chapter.completion !== 100) return false;
      if (view === "recent" && !chapter.lastOpened) return false;
      if (view === "bookmarks" && !bookmarks.includes(chapter.id)) return false;
      return true;
    });
  }, [query, grade, subject, completion, view, bookmarks]);

  function reset() {
    setQuery("");
    setGrade(libraryGrades[0]);
    setSubject(librarySubjects[0]);
    setCompletion(completionFilters[0]);
    setView("all");
  }

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Learning Hub"
      description="Every chapter in your syllabus — search, filter and pick up where you left off."
    >
      <section className="tile space-y-4 p-5 sm:p-6" aria-label="Chapter filters">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="hub-search">Search chapters</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="hub-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try 'Real Numbers' or 'Light'"
                className="rounded-2xl pl-9"
              />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <FilterSelect id="hub-grade" label="Grade" value={grade} onChange={setGrade} options={libraryGrades} />
            <FilterSelect id="hub-subject" label="Subject" value={subject} onChange={setSubject} options={librarySubjects} />
            <FilterSelect
              id="hub-completion"
              label="Completion"
              value={completion}
              onChange={(value) => setCompletion(value as CompletionFilter)}
              options={[...completionFilters]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ViewChip active={view === "all"} onClick={() => setView("all")} icon={SlidersHorizontal}>
            All chapters
          </ViewChip>
          <ViewChip active={view === "recent"} onClick={() => setView("recent")} icon={History}>
            Recently viewed
          </ViewChip>
          <ViewChip active={view === "bookmarks"} onClick={() => setView("bookmarks")} icon={BookMarked}>
            Bookmarks
          </ViewChip>
          <p className="ml-auto text-xs text-muted-foreground" aria-live="polite">
            {results.length} of {libraryChapters.length} chapters
          </p>
        </div>
      </section>

      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              bookmarked={bookmarks.includes(chapter.id)}
              downloaded={downloads.includes(chapter.id)}
              onToggleBookmark={toggleBookmark}
              onDownload={download}
            />
          ))}
        </div>
      ) : (
        <NoResults onReset={reset} />
      )}
    </PortalPage>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="rounded-2xl">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ViewChip({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      className="rounded-2xl"
      aria-pressed={active}
      onClick={onClick}
    >
      <Icon className="size-4" /> {children}
    </Button>
  );
}
