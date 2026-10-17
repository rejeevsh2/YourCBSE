import { RevisionCardForm } from "@/components/student/RevisionCardForm";
import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  Music,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { PrivateLessonAttachment } from "@/components/lessons/PrivateLessonAttachment";
import { Button } from "@/components/ui/button";
import { YouTubeVideo } from "@/components/lessons/YouTubeVideo";
import { parseYouTubeVideo } from "@/lib/youtube";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/lib/auth";

const PUBLIC_API = `${API_BASE_URL}/public`;
const AUTH_API = API_BASE_URL;

/* =========================================================
   TYPES
========================================================= */

type LessonContent = {
  id: number;
  lesson_id: number;
  title: string;
  content_type:
    | "text"
    | "video"
    | "pdf"
    | "ppt"
    | "image"
    | "audio"
    | "quiz"
    | "worksheet"
    | "activity";
  content: string | null;
  file_path: string | null;
  file_mime_type?: string | null;
  has_uploaded_file?: boolean;
  external_url: string | null;
  display_order: number | null;
  is_free: boolean;
  is_active: boolean;
};

type InteractiveApp = {
  id: number;
  lesson_id: number;
  title: string;
  description: string | null;
  source_type: "external" | "html" | "zip";
  file_path: string | null;
  external_url: string | null;
  entry_url: string | null;
  version: string | null;
  display_order: number | null;
  is_published: boolean;
  is_active: boolean;
};

type Lesson = {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
  lesson_number: number;
  summary: string | null;
  duration: number | null;
  display_order: number | null;
  is_published: boolean;
  is_active: boolean;
  contents?: LessonContent[];
  interactive_apps?: InteractiveApp[];
};
type LessonProgress = {
  id: number;
  user_id: number;
  lesson_id: number;
  is_completed: boolean;
  started_at: string | null;
  last_opened_at: string | null;
  completed_at: string | null;
};

/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute("/student/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lesson — YourSchool" },
      {
        name: "description",
        content: "Study your YourSchool lesson.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),

  component: StudentLessonPage,
});

/* =========================================================
   PAGE
========================================================= */

function StudentLessonPage() {
  const { lessonId } = Route.useParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [chapterLessons, setChapterLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [progress, setProgress] =
  useState<LessonProgress | null>(null);

const [progressLoading, setProgressLoading] =
  useState(true);

const [progressSaving, setProgressSaving] =
  useState(false);
  const [isBookmarked, setIsBookmarked] =
  useState(false);

const [bookmarkLoading, setBookmarkLoading] =
  useState(true);

const [bookmarkSaving, setBookmarkSaving] =
  useState(false);

  async function loadLesson() {
    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch(`${PUBLIC_API}/lessons/${lessonId}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "This lesson is not available or has not been published.",
          );
        }

        throw new Error("Could not load this lesson.");
      }

      const data: Lesson = await response.json();

      setLesson(data);

      const chapterResponse = await authenticatedFetch(
  `${PUBLIC_API}/chapters/${data.chapter_id}/lessons`,
  {
    headers: {
      Accept: "application/json",
    },
  },
);

      if (chapterResponse.ok) {
        const chapterData: Lesson[] = await chapterResponse.json();

        setChapterLessons(chapterData);
      } else {
        setChapterLessons([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load lesson.",
      );
    } finally {
      setLoading(false);
    }
  }

async function loadProgress() {
  const token = getAuthToken();

  if (!token) {
    setProgress(null);
    setProgressLoading(false);
    return;
  }

  setProgressLoading(true);

  try {
    const openResponse = await fetch(
      `${AUTH_API}/lessons/${lessonId}/progress/open`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!openResponse.ok) {
      throw new Error("Could not record lesson progress.");
    }

    const data: {
      progress: LessonProgress;
    } = await openResponse.json();

    setProgress(data.progress);
  } catch (err) {
    console.error("Lesson progress error:", err);
  } finally {
    setProgressLoading(false);
  }
}

async function toggleComplete() {
  const token = getAuthToken();

  if (!token || progressSaving) {
    return;
  }

  setProgressSaving(true);

  try {
    const action = progress?.is_completed
      ? "incomplete"
      : "complete";

    const response = await fetch(
      `${AUTH_API}/lessons/${lessonId}/progress/${action}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Could not update lesson progress.");
    }

    const data: {
      progress: LessonProgress | null;
    } = await response.json();

    setProgress(data.progress);
  } catch (err) {
    console.error("Lesson completion error:", err);
  } finally {
    setProgressSaving(false);
  }
}
async function loadBookmarkStatus() {
  const token = getAuthToken();

  if (!token) {
    setIsBookmarked(false);
    setBookmarkLoading(false);
    return;
  }

  setBookmarkLoading(true);

  try {
    const response = await fetch(
      `${AUTH_API}/lessons/${lessonId}/bookmark`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        "Could not load bookmark status.",
      );
    }

    const data = await response.json();

    setIsBookmarked(Boolean(data.bookmarked));
  } catch (err) {
    console.error("Bookmark status error:", err);
  } finally {
    setBookmarkLoading(false);
  }
}

async function toggleBookmark() {
  const token = getAuthToken();

  if (!token || bookmarkSaving) {
    return;
  }

  setBookmarkSaving(true);

  try {
    const response = await fetch(
      `${AUTH_API}/lessons/${lessonId}/bookmark`,
      {
        method: isBookmarked ? "DELETE" : "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        "Could not update bookmark.",
      );
    }

    setIsBookmarked(!isBookmarked);
  } catch (err) {
    console.error("Bookmark update error:", err);
  } finally {
    setBookmarkSaving(false);
  }
}

  useEffect(() => {
  void loadLesson();
  void loadProgress();
  void loadBookmarkStatus();
}, [lessonId]);

  const currentLessonIndex = chapterLessons.findIndex(
    (item) => item.id === Number(lessonId),
  );

  const previousLesson =
    currentLessonIndex > 0
      ? chapterLessons[currentLessonIndex - 1]
      : null;

  const nextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex < chapterLessons.length - 1
      ? chapterLessons[currentLessonIndex + 1]
      : null;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <PortalPage
        portalLabel="Student Portal"
        portalPath="/student"
        title="Lesson"
        description="Loading your lesson..."
showNotice={false}
      >
        <section className="tile flex items-center justify-center gap-3 p-12">
          <Loader2 className="size-5 animate-spin" />

          <span className="text-sm text-muted-foreground">
            Loading lesson content...
          </span>
        </section>
      </PortalPage>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !lesson) {
    return (
      <PortalPage
        portalLabel="Student Portal"
        portalPath="/student"
        title="Lesson unavailable"
        description="We could not open this lesson."
showNotice={false}
      >
        <section className="tile p-10 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 font-heading text-xl font-bold">
            Lesson unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            {error || "The requested lesson could not be found."}
          </p>

          <div className="mt-5 flex justify-center gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              asChild
            >
              <Link to="/student/learning-hub">
                <ArrowLeft className="size-4" />
                Learning Hub
              </Link>
            </Button>

            <Button
              type="button"
              className="rounded-2xl"
              onClick={() => void loadLesson()}
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        </section>
      </PortalPage>
    );
  }

  const contents = lesson.contents ?? [];
  const interactiveApps = lesson.interactive_apps ?? [];

  /* =======================================================
     PAGE
  ======================================================= */

  return (
   <PortalPage
  portalLabel="Student Portal"
  portalPath="/student"
  title={lesson.title}
  description={
    lesson.summary || `Lesson ${lesson.lesson_number}`
  }
  showNotice={false}
  actions={
    <Button
          variant="outline"
          className="rounded-2xl"
          asChild
        >
          <Link
            to="/student/chapter/$chapterSlug"
            params={{
              chapterSlug: String(lesson.chapter_id),
            }}
          >
            <ArrowLeft className="size-4" />
            Back to chapter
          </Link>
        </Button>
      }
    >
      <div className="space-y-5">

        {/* =================================================
            LESSON HEADER
        ================================================= */}

        <section className="tile p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <BookOpen className="size-7" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full"
                >
                  Lesson {lesson.lesson_number}
                </Badge>

                <Badge
                  variant="outline"
                  className="rounded-full"
                >
                  Published
                </Badge>
{progress?.is_completed ? (
  <Badge
    variant="secondary"
    className="rounded-full"
  >
    <CheckCircle2 className="mr-1 size-3.5" />
    Completed
  </Badge>
) : null}


                {lesson.duration ? (
                  <Badge
                    variant="outline"
                    className="rounded-full"
                  >
                    {lesson.duration} min
                  </Badge>
                ) : null}

                {interactiveApps.length > 0 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full"
                  >
                    {interactiveApps.length} Interactive{" "}
                    {interactiveApps.length === 1
                      ? "App"
                      : "Apps"}
                  </Badge>
                ) : null}
              </div>

              <h2 className="mt-3 font-heading text-2xl font-bold">
                {lesson.title}
              </h2>

              {lesson.summary ? (
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  {lesson.summary}
                </p>
              ) : null}
            </div>
          </div>
        </section>

                {/* =================================================
            LESSON PROGRESS
        ================================================= */}

        <section className="tile p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                {progress?.is_completed ? (
                  <CheckCircle2 className="size-5" />
                ) : progressLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <BookOpen className="size-5" />
                )}
              </span>

              <div>
                <h2 className="font-heading font-bold">
                  Lesson Progress
                </h2>

                <p className="text-sm text-muted-foreground">
                  {progressLoading
                    ? "Checking your progress..."
                    : progress?.is_completed
                      ? "You have completed this lesson."
                      : "Complete the lesson when you finish studying."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                disabled={bookmarkLoading || bookmarkSaving}
                onClick={() => void toggleBookmark()}
              >
                {bookmarkSaving || bookmarkLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Bookmark className="size-4" />
                )}

                {bookmarkSaving
                  ? "Saving..."
                  : bookmarkLoading
                    ? "Checking..."
                    : isBookmarked
                      ? "Saved"
                      : "Bookmark"}
              </Button>

              <Button
                type="button"
                variant={
                  progress?.is_completed
                    ? "outline"
                    : "default"
                }
                className="rounded-2xl"
                disabled={
                  progressLoading ||
                  progressSaving
                }
                onClick={() => void toggleComplete()}
              >
                {progressSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : progress?.is_completed ? (
                  <CheckCircle2 className="size-4" />
                ) : null}

                {progressSaving
                  ? "Saving..."
                  : progress?.is_completed
                    ? "Mark as Incomplete"
                    : "Mark Lesson Complete"}
              </Button>
            </div>
          </div>
        </section>

        {/* =================================================
            LESSON CONTENT
        ================================================= */}

        {contents.length === 0 ? (
          <section className="tile p-10 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-3 font-heading text-lg font-bold">
              No lesson content yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              This lesson is published, but no active learning
              content has been added yet.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {contents.map((item, index) => (
              <ContentBlock
                key={item.id}
                item={item}
                number={index + 1}
              />
            ))}
          </section>
        )}



        {/* =================================================
            INTERACTIVE APPS
        ================================================= */}

        {interactiveApps.length > 0 ? (
          <section className="space-y-4">
            <div className="tile p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Activity className="size-6" />
                </span>

                <div>
                  <h2 className="font-heading text-xl font-bold">
                    Interactive Apps
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Explore interactive learning activities for
                    this lesson.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {interactiveApps.map((app) => (
                <InteractiveAppCard
                  key={app.id}
                  app={app}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* =================================================
            PREVIOUS / NEXT NAVIGATION
        ================================================= */}

        <section className="tile p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {previousLesson ? (
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  asChild
                >
                  <Link
                    to="/student/lesson/$lessonId"
                    params={{
                      lessonId: String(previousLesson.id),
                    }}
                  >
                    <ArrowLeft className="size-4" />
                    Previous Lesson
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  disabled
                >
                  <ArrowLeft className="size-4" />
                  Previous Lesson
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              className="rounded-2xl"
              asChild
            >
              <Link
                to="/student/chapter/$chapterSlug"
                params={{
                  chapterSlug: String(lesson.chapter_id),
                }}
              >
                All Lessons
              </Link>
            </Button>

            <div>
              {nextLesson ? (
                <Button
                  className="rounded-2xl"
                  asChild
                >
                  <Link
                    to="/student/lesson/$lessonId"
                    params={{
                      lessonId: String(nextLesson.id),
                    }}
                  >
                    Next Lesson
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  className="rounded-2xl"
                  disabled
                >
                  Next Lesson
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
      <RevisionCardForm lessonId={lesson.id} />
    </PortalPage>
  );
}

/* =========================================================
   INTERACTIVE APP CARD
========================================================= */

function InteractiveAppCard({
  app,
}: {
  app: InteractiveApp;
}) {
  const launchUrl =
    app.source_type === "external"
      ? app.external_url
      : app.entry_url || app.file_path;

  return (
    <article className="tile flex h-full flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Activity className="size-6" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-lg font-bold">
              {app.title}
            </h3>

            <Badge
              variant="secondary"
              className="rounded-full"
            >
              Interactive
            </Badge>
          </div>

          {app.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {app.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="rounded-full"
          >
            {app.source_type === "external"
              ? "Online App"
              : app.source_type.toUpperCase()}
          </Badge>

          {app.version ? (
            <Badge
              variant="outline"
              className="rounded-full"
            >
              v{app.version}
            </Badge>
          ) : null}
        </div>

        {launchUrl ? (
          <Button
            className="rounded-2xl"
            asChild
          >
            <a
              href={launchUrl}
              target={app.source_type === "external" ? "_blank" : "_self"}
              rel="noreferrer"
            >
              <PlayCircle className="size-4" />
              Launch App
              <ExternalLink className="size-4" />
            </a>
          </Button>
        ) : (
          <Button
            className="rounded-2xl"
            disabled
          >
            App unavailable
          </Button>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   CONTENT BLOCK
========================================================= */

function ContentBlock({
  item,
  number,
}: {
  item: LessonContent;
  number: number;
}) {
  const Icon = getContentIcon(item.content_type);

  return (
    <article id={"lesson-content-" + item.id} className="tile scroll-mt-24 overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 border-b border-border/70 p-4 sm:px-6">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Part {number} · {formatType(item.content_type)}
          </p>

          <h2 className="font-heading text-lg font-bold">
            {item.title}
          </h2>
        </div>

        {item.is_free ? (
          <Badge
            variant="secondary"
            className="rounded-full"
          >
            Free
          </Badge>
        ) : null}
      </header>

      <div className="p-5 sm:p-6">
        {item.content_type === "ppt" ? (
          item.has_uploaded_file && !item.file_path ? (
            <PrivateLessonAttachment item={item} />
          ) : (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              This older or externally linked PowerPoint is not available as secure
              online slides. Ask your teacher or administrator to re-upload the
              presentation in YourSchool so it can be converted for viewing here.
            </p>
          )
        ) : item.has_uploaded_file && !item.file_path ? (
          <PrivateLessonAttachment item={item} />
        ) : (
          <>
        {item.content_type === "text" ? (
          <TextContent item={item} />
        ) : null}

        {item.content_type === "video" ? (
          <VideoContent item={item} />
        ) : null}

        {item.content_type === "image" ? (
          <ImageContent item={item} />
        ) : null}

        {item.content_type === "audio" ? (
          <AudioContent item={item} />
        ) : null}

        {item.content_type === "pdf" ? (
          <FileContent
            item={item}
            label="Open PDF"
          />
        ) : null}

        {item.content_type === "worksheet" ? (
          <FileContent
            item={item}
            label="Open worksheet"
          />
        ) : null}

        {item.content_type === "quiz" ? (
          <GeneralContent item={item} />
        ) : null}

        {item.content_type === "activity" ? (
          <GeneralContent item={item} />
        ) : null}
          </>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   TEXT
========================================================= */

function TextContent({
  item,
}: {
  item: LessonContent;
}) {
  if (!item.content) {
    return <EmptyContent />;
  }

  return (
    <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">
      {item.content}
    </div>
  );
}

/* =========================================================
   VIDEO
========================================================= */

function VideoContent({
  item,
}: {
  item: LessonContent;
}) {
  const url = item.external_url || item.file_path;

  if (!url) {
    return (
      <div className="space-y-4">
        {item.content ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {item.content}
          </p>
        ) : null}

        <EmptyContent />
      </div>
    );
  }

  const youtube = parseYouTubeVideo(url);

  const isDirectVideo =
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

  return (
    <div className="space-y-4">
      {item.content ? (
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {item.content}
        </p>
      ) : null}

      {youtube ? (
        <YouTubeVideo key={url} video={youtube} title={item.title} />
      ) : isDirectVideo ? (
        <div className="overflow-hidden rounded-2xl border bg-black">
          <video
            controls
            className="aspect-video w-full"
            src={url}
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-center">
          <PlayCircle className="mx-auto size-9 text-muted-foreground" />

          <p className="mt-3 text-sm text-muted-foreground">
            This video cannot be embedded directly.
          </p>
        </div>
      )}

      {!youtube ? (
        <Button
          variant="outline"
          className="rounded-2xl"
          asChild
        >
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="size-4" />
            Open video
          </a>
        </Button>
      ) : null}
    </div>
  );
}

/* =========================================================
   IMAGE
========================================================= */

function ImageContent({
  item,
}: {
  item: LessonContent;
}) {
  const url = item.external_url || item.file_path;

  return (
    <div className="space-y-4">
      {item.content ? (
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {item.content}
        </p>
      ) : null}

      {url ? (
        <img
          src={url}
          alt={item.title}
          className="max-h-[650px] w-full rounded-2xl border object-contain"
        />
      ) : (
        <EmptyContent />
      )}
    </div>
  );
}

/* =========================================================
   AUDIO
========================================================= */

function AudioContent({
  item,
}: {
  item: LessonContent;
}) {
  const url = item.external_url || item.file_path;

  return (
    <div className="space-y-4">
      {item.content ? (
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {item.content}
        </p>
      ) : null}

      {url ? (
        <audio
          controls
          className="w-full"
          src={url}
        >
          Your browser does not support audio playback.
        </audio>
      ) : (
        <EmptyContent />
      )}
    </div>
  );
}

/* =========================================================
   PDF / WORKSHEET
========================================================= */

function FileContent({
  item,
  label,
}: {
  item: LessonContent;
  label: string;
}) {
  const url = item.external_url || item.file_path;

  if (!url) {
    return (
      <div className="space-y-4">
        {item.content ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {item.content}
          </p>
        ) : null}

        <EmptyContent />
      </div>
    );
  }

  const isPdf =
    item.content_type === "pdf" ||
    /\.pdf(\?.*)?$/i.test(url);

  return (
    <div className="space-y-4">
      {item.content ? (
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {item.content}
        </p>
      ) : null}

      {isPdf && import.meta.env.VITE_NATIVE_APP !== "true" ? (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <iframe
            src={url}
            title={item.title}
            className="h-[700px] w-full"
          />
        </div>
      ) : null}

      <Button
        variant="outline"
        className="rounded-2xl"
        asChild
      >
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          <FileText className="size-4" />
          {label}
          <ExternalLink className="size-4" />
        </a>
      </Button>
    </div>
  );
}

/* =========================================================
   QUIZ / ACTIVITY
========================================================= */

function GeneralContent({
  item,
}: {
  item: LessonContent;
}) {
  const fileUrl = item.file_path;

  return (
    <div className="space-y-4">
      {item.content ? (
        <div className="whitespace-pre-wrap text-sm leading-7">
          {item.content}
        </div>
      ) : null}

      {fileUrl ? (
        <>
          {/\.pdf(\?.*)?$/i.test(fileUrl) && import.meta.env.VITE_NATIVE_APP !== "true" ? (
            <div className="overflow-hidden rounded-2xl border bg-background">
              <iframe
                src={fileUrl}
                title={item.title}
                className="h-[700px] w-full"
              />
            </div>
          ) : null}

          <Button
            variant="outline"
            className="rounded-2xl"
            asChild
          >
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
            >
              <FileText className="size-4" />
              Open attached file
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </>
      ) : null}

      {item.external_url ? (
        <Button
          variant="outline"
          className="rounded-2xl"
          asChild
        >
          <a
            href={item.external_url}
            target="_blank"
            rel="noreferrer"
          >
            Open resource
            <ExternalLink className="size-4" />
          </a>
        </Button>
      ) : null}

      {!item.content &&
      !item.external_url &&
      !item.file_path ? (
        <EmptyContent />
      ) : null}
    </div>
  );
}

/* =========================================================
   EMPTY CONTENT
========================================================= */

function EmptyContent() {
  return (
    <p className="text-sm text-muted-foreground">
      No content has been added to this section yet.
    </p>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatType(
  type: LessonContent["content_type"],
) {
  switch (type) {
    case "pdf":
      return "PDF";

    case "ppt":
      return "PowerPoint";

    case "video":
      return "Video";

    case "image":
      return "Image";

    case "audio":
      return "Audio";

    case "quiz":
      return "Quiz";

    case "worksheet":
      return "Worksheet";

    case "activity":
      return "Activity";

    default:
      return "Text";
  }
}

function getContentIcon(
  type: LessonContent["content_type"],
) {
  switch (type) {
    case "video":
      return PlayCircle;

    case "image":
      return ImageIcon;

    case "audio":
      return Music;

    case "quiz":
      return ListChecks;

    case "worksheet":
      return ClipboardList;

    case "activity":
      return Activity;

    case "ppt":
    case "pdf":
      return FileText;

    default:
      return FileText;
  }
}
