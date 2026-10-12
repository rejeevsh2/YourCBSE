import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookMarked,
  BookOpen,
  Loader2,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ResourceCard } from "@/components/student/ResourceCard";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth/session";

const AUTH_API = API_BASE_URL;

interface Subject {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  title: string;
  subject: Subject | null;
}

interface Chapter {
  id: number;
  title: string;
  unit: Unit | null;
}

interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
  lesson_number: number;
  summary: string | null;
  duration: number | null;
  chapter: Chapter | null;
}

interface BookmarkItem {
  id: number;
  user_id: number;
  lesson_id: number;
  created_at: string;
  updated_at: string;
  lesson: Lesson | null;
}

interface BookmarkResponse {
  bookmarks: BookmarkItem[];
  count: number;
}

export const Route = createFileRoute("/student/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmark Centre — YourSchool" },
      {
        name: "description",
        content: "Your saved lessons in one place.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookmarkCentre,
});

function BookmarkCentre() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadBookmarks() {
    const token = getAuthToken();

    if (!token) {
      setBookmarks([]);
      setError("Please sign in to view your bookmarks.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${AUTH_API}/bookmarks`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Could not load your bookmarks.");
      }

      const data: BookmarkResponse = await response.json();

      setBookmarks(data.bookmarks ?? []);
    } catch (err) {
      console.error("Bookmark centre error:", err);

      setBookmarks([]);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your bookmarks.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBookmarks();
  }, []);

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return bookmarks;
    }

    return bookmarks.filter((bookmark) => {
      const lesson = bookmark.lesson;
      const subject = lesson?.chapter?.unit?.subject?.name ?? "";
      const chapter = lesson?.chapter?.title ?? "";
      const unit = lesson?.chapter?.unit?.title ?? "";

      return [
        lesson?.title ?? "",
        lesson?.summary ?? "",
        subject,
        chapter,
        unit,
      ].some((value) =>
        value.toLowerCase().includes(search),
      );
    });
  }, [bookmarks, query]);

  const savedToday = useMemo(() => {
    const today = new Date().toDateString();

    return bookmarks.filter(
      (bookmark) =>
        new Date(bookmark.created_at).toDateString() === today,
    ).length;
  }, [bookmarks]);

  const subjectsCount = useMemo(() => {
    return new Set(
      bookmarks
        .map(
          (bookmark) =>
            bookmark.lesson?.chapter?.unit?.subject?.id,
        )
        .filter((id): id is number => typeof id === "number"),
    ).size;
  }, [bookmarks]);

  const chaptersCount = useMemo(() => {
    return new Set(
      bookmarks
        .map((bookmark) => bookmark.lesson?.chapter?.id)
        .filter((id): id is number => typeof id === "number"),
    ).size;
  }, [bookmarks]);

  return (
    <PortalPage
  portalLabel="Student Portal"
  portalPath="/student"
  title="Bookmark Centre"
  description="Your saved lessons, ready whenever you want to continue learning."
  showNotice={false}
>
      <StatGrid
        items={[
          {
            label: "Total saved",
            value: String(bookmarks.length),
            tone: "primary",
          },
          {
            label: "Subjects",
            value: String(subjectsCount),
            tone: "primary",
          },
          {
            label: "Chapters",
            value: String(chaptersCount),
            tone: "success",
          },
          {
            label: "Saved today",
            value: String(savedToday),
            tone: "warning",
          },
        ]}
      />

      <div className="tile p-4">
        <label
          htmlFor="bookmark-search"
          className="sr-only"
        >
          Search bookmarks
        </label>

        <input
          id="bookmark-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search saved lessons..."
          className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        />

        {!loading && !error ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {results.length} of {bookmarks.length} saved lessons shown
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="tile flex items-center justify-center gap-3 p-10">
          <Loader2
            className="size-5 animate-spin"
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">
            Loading your bookmarks...
          </span>
        </div>
      ) : error ? (
        <EmptyState
          icon={
            <BookMarked
              className="size-6"
              aria-hidden="true"
            />
          }
          title="Could not load bookmarks"
          description={error}
        />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={
            <BookMarked
              className="size-6"
              aria-hidden="true"
            />
          }
          title="No saved lessons yet"
          description="Open a lesson and select Bookmark to save it here."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={
            <BookMarked
              className="size-6"
              aria-hidden="true"
            />
          }
          title="No bookmarks match your search"
          description="Try another lesson, subject, chapter, or unit name."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((bookmark) => {
            const lesson = bookmark.lesson;

            if (!lesson) {
              return null;
            }

            const subject =
              lesson.chapter?.unit?.subject?.name ??
              "Subject";

            const chapter =
              lesson.chapter?.title ?? "Chapter";

            const duration = lesson.duration
              ? `${lesson.duration} min`
              : "Lesson";

            return (
              <ResourceCard
                key={bookmark.id}
                icon={BookOpen}
                title={lesson.title}
                meta={`${subject} · ${chapter} · ${duration}`}
                badge="Lesson"
                footnote={`Saved ${new Date(
                  bookmark.created_at,
                ).toLocaleDateString()}`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    asChild
                  >
                    <Link
                      to="/student/lesson/$lessonId"
                      params={{
                        lessonId: String(lesson.id),
                      }}
                    >
                      Open
                    </Link>
                  </Button>
                }
              />
            );
          })}
        </ul>
      )}
    </PortalPage>
  );
}