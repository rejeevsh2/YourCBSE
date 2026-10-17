import {
  Activity,
  ClipboardList,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  ListChecks,
  Music,
  PlayCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PrivateLessonAttachment } from "@/components/lessons/PrivateLessonAttachment";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/auth/http";

export type TeacherLessonContent = {
  id: number;
  lesson_id?: number;
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
  content?: string | null;
  file_path?: string | null;
  has_uploaded_file?: boolean;
  file_mime_type?: string | null;
  external_url?: string | null;
  display_order?: number | null;
  is_free?: boolean;
  is_active?: boolean;
};

const API_ORIGIN =
  API_BASE_URL.replace(/\/api\/?$/, "");

function resolveUrl(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  try {
    if (/^https?:\/\//i.test(value)) {
      const parsed = new URL(value);

      if (
        (
          parsed.hostname === "localhost" ||
          parsed.hostname === "127.0.0.1"
        ) &&
        parsed.pathname.startsWith("/storage/")
      ) {
        return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
      }

      return value;
    }
  } catch {
    // Continue with relative-path handling.
  }

  if (value.startsWith("/storage/")) {
    return `${API_ORIGIN}${value}`;
  }

  if (value.startsWith("storage/")) {
    return `${API_ORIGIN}/${value}`;
  }

  if (value.startsWith("/")) {
    return `${API_ORIGIN}${value}`;
  }

  return `${API_ORIGIN}/storage/${value}`;
}
function youtubeEmbedUrl(
  url: string,
) {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname === "youtu.be" ||
      parsed.hostname === "www.youtu.be"
    ) {
      const id =
        parsed.pathname
          .replace("/", "")
          .trim();

      return id
        ? `https://www.youtube.com/embed/${id}`
        : null;
    }

    if (
      parsed.hostname.includes(
        "youtube.com",
      )
    ) {
      if (
        parsed.pathname.startsWith(
          "/embed/",
        )
      ) {
        return url;
      }

      if (
        parsed.pathname.startsWith(
          "/shorts/",
        )
      ) {
        const id =
          parsed.pathname.split("/")[2];

        return id
          ? `https://www.youtube.com/embed/${id}`
          : null;
      }

      const id =
        parsed.searchParams.get("v");

      return id
        ? `https://www.youtube.com/embed/${id}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

function typeLabel(
  type: TeacherLessonContent["content_type"],
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

function typeIcon(
  type: TeacherLessonContent["content_type"],
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
    default:
      return FileText;
  }
}

export function TeacherLessonPreview({
  contents,
}: {
  contents: TeacherLessonContent[];
}) {
  if (!contents.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No lesson content has been added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">
          Lesson content preview
        </h2>

        <p className="text-sm text-muted-foreground">
          This is the actual learning content
          available inside this lesson.
        </p>
      </div>

      {contents.map((item, index) => (
        <ContentBlock
          key={item.id}
          item={item}
          number={index + 1}
        />
      ))}
    </div>
  );
}

function ContentBlock({
  item,
  number,
}: {
  item: TeacherLessonContent;
  number: number;
}) {
  const Icon =
    typeIcon(item.content_type);

  const resourceUrl =
    resolveUrl(
      item.external_url ||
        item.file_path,
    );

  return (
    <article className="overflow-hidden rounded-2xl border bg-background">
      <header className="flex flex-wrap items-center gap-3 border-b p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Part {number} ·{" "}
            {typeLabel(
              item.content_type,
            )}
          </p>

          <h3 className="font-semibold">
            {item.title}
          </h3>
        </div>

        {item.is_active === false ? (
          <Badge variant="outline">
            Inactive
          </Badge>
        ) : null}
      </header>

      <div className="space-y-4 p-5">
        {item.has_uploaded_file && !item.file_path ? (
          <PrivateLessonAttachment item={item} />
        ) : null}
        {item.content ? (
          <div className="whitespace-pre-wrap text-sm leading-7">
            {item.content}
          </div>
        ) : null}

        {item.content_type ===
          "video" &&
        resourceUrl ? (
          <VideoPreview
            url={resourceUrl}
            title={item.title}
          />
        ) : null}

        {item.content_type ===
          "image" &&
        resourceUrl ? (
          <img
            src={resourceUrl}
            alt={item.title}
            className="max-h-[650px] w-full rounded-xl border object-contain"
          />
        ) : null}

        {item.content_type ===
          "audio" &&
        resourceUrl ? (
          <audio
            controls
            src={resourceUrl}
            className="w-full"
          >
            Your browser does not support
            audio playback.
          </audio>
        ) : null}

        {(item.content_type ===
          "pdf" ||
          item.content_type ===
            "worksheet") &&
        resourceUrl &&
        /\.pdf(\?.*)?$/i.test(
          resourceUrl,
        ) ? (
          <iframe
            src={resourceUrl}
            title={item.title}
            className="h-[650px] w-full rounded-xl border"
          />
        ) : null}

        {resourceUrl &&
        item.content_type !==
          "video" &&
        item.content_type !==
          "image" &&
        item.content_type !==
          "audio" ? (
          <Button
            variant="outline"
            asChild
          >
            <a
              href={resourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" />
              {item.content_type === "ppt" ? "Open PowerPoint" : "Open resource"}
            </a>
          </Button>
        ) : null}

        {!item.content &&
        !resourceUrl &&
        !item.has_uploaded_file ? (
          <p className="text-sm text-muted-foreground">
            No content has been added to
            this section yet.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function VideoPreview({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const youtube =
    youtubeEmbedUrl(url);

  if (youtube) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl border bg-black">
        <iframe
          src={youtube}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(
      url,
    )
  ) {
    return (
      <video
        controls
        src={url}
        className="aspect-video w-full rounded-xl border bg-black"
      >
        Your browser does not support
        video playback.
      </video>
    );
  }

  return (
    <Button
      variant="outline"
      asChild
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        <PlayCircle className="size-4" />
        Open video
        <ExternalLink className="size-4" />
      </a>
    </Button>
  );
}