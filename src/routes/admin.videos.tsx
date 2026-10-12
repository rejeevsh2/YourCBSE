import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/videos")({
  head: () => ({
    meta: [
      {
        title: "Videos — YourSchool Admin",
      },
      {
        name: "description",
        content: "Manage the real lesson video library.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminVideosPage,
});

type Lesson = {
  id: number;
  title: string;
};

type LessonContent = {
  id: number;
  lesson_id: number;
  title: string;
  content_type: string;
  content: string | null;
  file_path: string | null;
  external_url: string | null;
  display_order: number | null;
  is_free: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  lesson?: Lesson | null;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getVideoUrl(item: LessonContent) {
  return item.file_path || item.external_url || null;
}

function getSourceLabel(item: LessonContent) {
  if (item.file_path) {
    return "Uploaded file";
  }

  if (item.external_url) {
    return "External";
  }

  return "No video file";
}

function AdminVideosPage() {
  const [items, setItems] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  async function loadVideos() {
    setLoading(true);

    try {
      const result =
        await apiRequest<LessonContent[]>(
          "/lesson-contents",
          {
            method: "GET",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not load videos.",
        );
      }

      const allItems = Array.isArray(result.data)
        ? result.data
        : [];

      setItems(
        allItems.filter(
          (item) =>
            item.content_type === "video",
        ),
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load videos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVideos();
  }, []);

  const filteredItems = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const lessonTitle =
        item.lesson?.title ?? "";

      const matchesSearch =
        !query ||
        item.title
          .toLowerCase()
          .includes(query) ||
        lessonTitle
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          item.is_active) ||
        (statusFilter === "inactive" &&
          !item.is_active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    items,
    search,
    statusFilter,
  ]);

  const uploadedCount =
    items.filter(
      (item) => Boolean(item.file_path),
    ).length;

  const externalCount =
    items.filter(
      (item) =>
        Boolean(item.external_url) &&
        !item.file_path,
    ).length;

  const activeCount =
    items.filter(
      (item) => item.is_active,
    ).length;

  function addVideo() {
    window.location.assign(
      "/admin/lesson-contents",
    );
  }

  function manageVideo(
    item: LessonContent,
  ) {
    window.location.assign(
      `/admin/lesson-contents?lesson=${item.lesson_id}`,
    );
  }

  function openVideo(
    item: LessonContent,
  ) {
    const url = getVideoUrl(item);

    if (!url) {
      toast.info(
        "This video has no file or external URL.",
      );
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function deleteVideo(
    item: LessonContent,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${item.title}"?\n\nThis will permanently remove this video content.`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    try {
      const result =
        await apiRequest(
          `/lesson-contents/${item.id}`,
          {
            method: "DELETE",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete video.",
        );
      }

      setItems((current) =>
        current.filter(
          (video) =>
            video.id !== item.id,
        ),
      );

      toast.success(
        "Video deleted.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete video.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Videos"
      description="Real lesson videos from Lesson Content."
      showNotice={false}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total videos"
          value={String(items.length)}
          hint="Real lesson videos"
          tone="primary"
        />

        <StatCard
          label="Uploaded"
          value={String(uploadedCount)}
          hint="Stored video files"
          tone="success"
        />

        <StatCard
          label="External"
          value={String(externalCount)}
          hint="Video links"
          tone="primary"
        />

        <StatCard
          label="Active"
          value={String(activeCount)}
          hint={`${items.length - activeCount} inactive`}
          tone="success"
        />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-3xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search videos or lessons..."
                className="pl-9"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">
                All statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() =>
                void loadVideos()
              }
            >
              <RefreshCw
                className={
                  loading
                    ? "size-4 animate-spin"
                    : "size-4"
                }
              />
              Refresh
            </Button>

            <Button
              onClick={addVideo}
            >
              <Plus className="size-4" />
              Add video
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">
                Video library
              </h2>

              <p className="text-sm text-muted-foreground">
                {filteredItems.length} of{" "}
                {items.length} videos
              </p>
            </div>

            <Video className="size-5 text-muted-foreground" />
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
              Loading videos...
            </div>
          ) : filteredItems.length ===
            0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
              <Video className="size-8 text-muted-foreground" />

              <div>
                <p className="font-medium">
                  No videos found
                </p>

                <p className="text-sm text-muted-foreground">
                  Add a video through Lesson Content.
                </p>
              </div>

              <Button
                onClick={addVideo}
              >
                Add video
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">
                      Video
                    </th>

                    <th className="px-5 py-3">
                      Lesson
                    </th>

                    <th className="px-5 py-3">
                      Source
                    </th>

                    <th className="px-5 py-3">
                      Access
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    <th className="px-5 py-3">
                      Updated
                    </th>

                    <th className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map(
                    (item) => {
                      const videoUrl =
                        getVideoUrl(item);

                      return (
                        <tr
                          key={item.id}
                          className="border-b last:border-b-0 hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                                <Video className="size-4" />
                              </div>

                              <span className="font-medium">
                                {item.title}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {item.lesson?.title ??
                              `Lesson ${item.lesson_id}`}
                          </td>

                          <td className="px-5 py-4">
                            {getSourceLabel(
                              item,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <Badge variant="outline">
                              {item.is_free
                                ? "Free"
                                : "Paid"}
                            </Badge>
                          </td>

                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                item.is_active
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {item.is_active
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                            {formatDate(
                              item.updated_at,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={
                                  !videoUrl
                                }
                                onClick={() =>
                                  openVideo(
                                    item,
                                  )
                                }
                              >
                                <ExternalLink className="size-4" />
                                Open
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  manageVideo(
                                    item,
                                  )
                                }
                              >
                                Manage
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={
                                  deletingId ===
                                  item.id
                                }
                                onClick={() =>
                                  void deleteVideo(
                                    item,
                                  )
                                }
                              >
                                <Trash2 className="size-4" />

                                {deletingId ===
                                item.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </PortalPage>
  );
}