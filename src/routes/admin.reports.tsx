import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  FileBarChart,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type Column,
} from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      {
        title: "Reports — YourTeacher Admin",
      },
      {
        name: "description",
        content:
          "Generate real platform, content, publishing and growth reports.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminReportsPage,
});

type Totals = {
  users: number;
  students: number;
  teachers: number;
  admins: number;

  grades: number;
  subjects: number;
  chapters: number;

  lessons: number;
  published_lessons: number;
  draft_lessons: number;
  active_lessons: number;

  lesson_contents: number;

  blog_posts: number;
  published_blog_posts: number;

  media_assets: number;
  active_media_assets: number;
  media_storage_bytes: number;

  flashcard_decks: number;
  published_flashcard_decks: number;
  flashcards: number;

  notifications: number;
  unread_notifications: number;
};

type Monthly = {
  labels: string[];
  students: number[];
  teachers: number[];
  lessons: number[];
  lesson_contents: number[];
  blog_posts: number[];
  media_assets: number[];
};

type PublicationItem = {
  total: number;
  published: number;
};

type Recent30Days = {
  new_students: number;
  new_teachers: number;
  new_lessons: number;
  new_lesson_contents: number;
  new_blog_posts: number;
  new_media_assets: number;
  new_flashcards: number;
};

type BreakdownItem = {
  label: string;
  value: number;
};

type TopChapter = {
  id: number;
  title: string;
  lessons: number;
  contents: number;
  share: number;
};

type Analytics = {
  totals: Totals;

  monthly: Monthly;

  publication: {
    lessons: PublicationItem;
    blog_posts: PublicationItem;
    flashcard_decks: PublicationItem;
  };

  recent_30_days: Recent30Days;

  content_types: BreakdownItem[];
  resource_categories: BreakdownItem[];
  top_chapters: TopChapter[];
};

type AdminStatsResponse = {
  students: number;
  teachers: number;
  lessons: number;
  drafts: number;
  analytics: Analytics;
};

type CsvValue =
  | string
  | number
  | boolean
  | null
  | undefined;

type CsvRow = CsvValue[];

type ReportRow = {
  id: string;
  name: string;
  description: string;
  format: string;
  size: string;
  generated: string;
  filename: string;
  rows: CsvRow[];
};

function csvEscape(
  value: CsvValue,
) {
  return `"${String(
    value ?? "",
  ).replace(/"/g, '""')}"`;
}

function rowsToCsv(
  rows: CsvRow[],
) {
  return rows
    .map((row) =>
      row
        .map(csvEscape)
        .join(","),
    )
    .join("\r\n");
}

function formatBytes(
  bytes: number,
) {
  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes /
    1024 ** index;

  return `${value.toFixed(
    index === 0 ? 0 : 2,
  )} ${units[index]}`;
}

function calculateCsvSize(
  rows: CsvRow[],
) {
  const csv =
    rowsToCsv(rows);

  return formatBytes(
    new Blob([csv]).size,
  );
}

function downloadCsv(
  filename: string,
  rows: CsvRow[],
) {
  const csv =
    rowsToCsv(rows);

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8",
      },
    );

  const url =
    URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement(
      "a",
    );

  link.href = url;
  link.download = filename;

  document.body.appendChild(
    link,
  );

  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function makePlatformSummary(
  analytics: Analytics,
): CsvRow[] {
  const { totals } =
    analytics;

  return [
    [
      "YourTeacher Platform Summary",
    ],
    [],
    ["Metric", "Value"],
    [
      "Total users",
      totals.users,
    ],
    [
      "Students",
      totals.students,
    ],
    [
      "Teachers",
      totals.teachers,
    ],
    [
      "Administrators",
      totals.admins,
    ],
    [
      "Grades",
      totals.grades,
    ],
    [
      "Subjects",
      totals.subjects,
    ],
    [
      "Chapters",
      totals.chapters,
    ],
    [
      "Lessons",
      totals.lessons,
    ],
    [
      "Published lessons",
      totals.published_lessons,
    ],
    [
      "Draft lessons",
      totals.draft_lessons,
    ],
    [
      "Lesson contents",
      totals.lesson_contents,
    ],
    [
      "Blog posts",
      totals.blog_posts,
    ],
    [
      "Media assets",
      totals.media_assets,
    ],
    [
      "Media storage bytes",
      totals.media_storage_bytes,
    ],
    [
      "Flashcard decks",
      totals.flashcard_decks,
    ],
    [
      "Flashcards",
      totals.flashcards,
    ],
    [
      "Notifications",
      totals.notifications,
    ],
  ];
}

function makeUserReport(
  analytics: Analytics,
): CsvRow[] {
  const { totals } =
    analytics;

  return [
    [
      "YourTeacher User Summary",
    ],
    [],
    [
      "Account type",
      "Count",
    ],
    [
      "Students",
      totals.students,
    ],
    [
      "Teachers",
      totals.teachers,
    ],
    [
      "Administrators",
      totals.admins,
    ],
    [
      "Total users",
      totals.users,
    ],
    [],
    [
      "Recent 30 days",
      "Count",
    ],
    [
      "New students",
      analytics.recent_30_days
        .new_students,
    ],
    [
      "New teachers",
      analytics.recent_30_days
        .new_teachers,
    ],
  ];
}

function makeCurriculumReport(
  analytics: Analytics,
): CsvRow[] {
  const { totals } =
    analytics;

  const rows: CsvRow[] = [
    [
      "YourTeacher Curriculum & Content Report",
    ],
    [],
    ["Metric", "Count"],
    [
      "Grades",
      totals.grades,
    ],
    [
      "Subjects",
      totals.subjects,
    ],
    [
      "Chapters",
      totals.chapters,
    ],
    [
      "Lessons",
      totals.lessons,
    ],
    [
      "Lesson contents",
      totals.lesson_contents,
    ],
    [],
    [
      "Lesson content type",
      "Count",
    ],
  ];

  for (
    const item of analytics.content_types
  ) {
    rows.push([
      item.label,
      item.value,
    ]);
  }

  if (
    analytics.resource_categories
      .length
  ) {
    rows.push(
      [],
      [
        "Resource category",
        "Count",
      ],
    );

    for (
      const item of analytics.resource_categories
    ) {
      rows.push([
        item.label,
        item.value,
      ]);
    }
  }

  rows.push(
    [],
    [
      "Chapter",
      "Lessons",
      "Contents",
    ],
  );

  for (
    const chapter of analytics.top_chapters
  ) {
    rows.push([
      chapter.title,
      chapter.lessons,
      chapter.contents,
    ]);
  }

  return rows;
}

function makePublishingReport(
  analytics: Analytics,
): CsvRow[] {
  const {
    publication,
  } = analytics;

  return [
    [
      "YourTeacher Publishing Report",
    ],
    [],
    [
      "Content type",
      "Total",
      "Published",
      "Not published",
    ],
    [
      "Lessons",
      publication.lessons.total,
      publication.lessons
        .published,
      publication.lessons.total -
        publication.lessons
          .published,
    ],
    [
      "Blog posts",
      publication.blog_posts
        .total,
      publication.blog_posts
        .published,
      publication.blog_posts
        .total -
        publication.blog_posts
          .published,
    ],
    [
      "Flashcard decks",
      publication.flashcard_decks
        .total,
      publication.flashcard_decks
        .published,
      publication.flashcard_decks
        .total -
        publication.flashcard_decks
          .published,
    ],
  ];
}

function makeMediaReport(
  analytics: Analytics,
): CsvRow[] {
  const { totals } =
    analytics;

  return [
    [
      "YourTeacher Media & Storage Report",
    ],
    [],
    ["Metric", "Value"],
    [
      "Media assets",
      totals.media_assets,
    ],
    [
      "Active assets",
      totals.active_media_assets,
    ],
    [
      "Inactive assets",
      totals.media_assets -
        totals.active_media_assets,
    ],
    [
      "Storage bytes",
      totals.media_storage_bytes,
    ],
    [
      "Storage formatted",
      formatBytes(
        totals.media_storage_bytes,
      ),
    ],
    [
      "New assets in last 30 days",
      analytics.recent_30_days
        .new_media_assets,
    ],
  ];
}

function makeFlashcardReport(
  analytics: Analytics,
): CsvRow[] {
  const { totals } =
    analytics;

  return [
    [
      "YourTeacher Flashcards Report",
    ],
    [],
    ["Metric", "Value"],
    [
      "Flashcard decks",
      totals.flashcard_decks,
    ],
    [
      "Published decks",
      totals.published_flashcard_decks,
    ],
    [
      "Unpublished decks",
      totals.flashcard_decks -
        totals.published_flashcard_decks,
    ],
    [
      "Flashcards",
      totals.flashcards,
    ],
    [
      "New flashcards in last 30 days",
      analytics.recent_30_days
        .new_flashcards,
    ],
  ];
}

function makeGrowthReport(
  analytics: Analytics,
): CsvRow[] {
  const {
    monthly,
  } = analytics;

  const rows: CsvRow[] = [
    [
      "YourTeacher Monthly Growth Report",
    ],
    [],
    [
      "Month",
      "Students",
      "Teachers",
      "Lessons",
      "Lesson contents",
      "Blog posts",
      "Media assets",
    ],
  ];

  monthly.labels.forEach(
    (
      label,
      index,
    ) => {
      rows.push([
        label,
        monthly.students[index] ??
          0,
        monthly.teachers[index] ??
          0,
        monthly.lessons[index] ??
          0,
        monthly.lesson_contents[
          index
        ] ?? 0,
        monthly.blog_posts[index] ??
          0,
        monthly.media_assets[index] ??
          0,
      ]);
    },
  );

  return rows;
}

function makeFullReport(
  analytics: Analytics,
): CsvRow[] {
  return [
    ...makePlatformSummary(
      analytics,
    ),
    [],
    [],
    ...makeUserReport(
      analytics,
    ),
    [],
    [],
    ...makeCurriculumReport(
      analytics,
    ),
    [],
    [],
    ...makePublishingReport(
      analytics,
    ),
    [],
    [],
    ...makeMediaReport(
      analytics,
    ),
    [],
    [],
    ...makeFlashcardReport(
      analytics,
    ),
    [],
    [],
    ...makeGrowthReport(
      analytics,
    ),
  ];
}

function AdminReportsPage() {
  const [stats, setStats] =
    useState<AdminStatsResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  async function loadReports() {
    setLoading(true);
    setError(null);

    try {
      const result =
        await apiRequest<AdminStatsResponse>(
          "/admin/stats",
          {
            method: "GET",
          },
        );

      if (
        !result.ok ||
        !result.data
      ) {
        throw new Error(
          result.message ||
            "Could not load report data.",
        );
      }

      setStats(
        result.data,
      );
    } catch (err) {
      console.error(
        "Admin reports error:",
        err,
      );

      setStats(null);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load report data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  const reports =
    useMemo<
      ReportRow[]
    >(() => {
      if (!stats) {
        return [];
      }

      const analytics =
        stats.analytics;

      const definitions = [
        {
          id:
            "platform-summary",
          name:
            "Platform summary",
          description:
            "Users, curriculum, content and platform totals",
          filename:
            "yourteacher-platform-summary.csv",
          rows:
            makePlatformSummary(
              analytics,
            ),
        },
        {
          id:
            "user-summary",
          name:
            "User summary",
          description:
            "Student, teacher and administrator account totals",
          filename:
            "yourteacher-user-summary.csv",
          rows:
            makeUserReport(
              analytics,
            ),
        },
        {
          id:
            "curriculum-content",
          name:
            "Curriculum & content report",
          description:
            "Grades, subjects, chapters, lessons and content distribution",
          filename:
            "yourteacher-curriculum-content.csv",
          rows:
            makeCurriculumReport(
              analytics,
            ),
        },
        {
          id:
            "publishing",
          name:
            "Publishing report",
          description:
            "Published and unpublished lessons, blogs and flashcard decks",
          filename:
            "yourteacher-publishing-report.csv",
          rows:
            makePublishingReport(
              analytics,
            ),
        },
        {
          id:
            "media-storage",
          name:
            "Media & storage report",
          description:
            "Media asset totals, active assets and storage usage",
          filename:
            "yourteacher-media-storage.csv",
          rows:
            makeMediaReport(
              analytics,
            ),
        },
        {
          id:
            "flashcards",
          name:
            "Flashcards report",
          description:
            "Deck publication and flashcard totals",
          filename:
            "yourteacher-flashcards-report.csv",
          rows:
            makeFlashcardReport(
              analytics,
            ),
        },
        {
          id:
            "monthly-growth",
          name:
            "Monthly growth report",
          description:
            "Six-month user and content creation history",
          filename:
            "yourteacher-monthly-growth.csv",
          rows:
            makeGrowthReport(
              analytics,
            ),
        },
      ];

      return definitions.map(
        (report) => ({
          ...report,
          format: "CSV",
          size:
            calculateCsvSize(
              report.rows,
            ),
          generated:
            "Live data",
        }),
      );
    }, [stats]);

  const columns =
    useMemo<
      Column<ReportRow>[]
    >(
      () => [
        {
          key: "name",
          header: "Report",

          render: (
            row,
          ) => (
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <FileBarChart className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {row.name}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {
                    row.description
                  }
                </p>
              </div>
            </div>
          ),
        },
        {
          key: "format",
          header: "Format",

          render: (
            row,
          ) => (
            <Badge
              variant="outline"
              className="rounded-full text-[11px]"
            >
              {row.format}
            </Badge>
          ),
        },
        {
          key: "size",
          header: "Size",

          render: (
            row,
          ) => (
            <span className="text-sm text-muted-foreground">
              {row.size}
            </span>
          ),
        },
        {
          key: "generated",
          header:
            "Source",

          render: (
            row,
          ) => (
            <span className="text-sm text-muted-foreground">
              {
                row.generated
              }
            </span>
          ),
        },
        {
          key: "actions",
          header: "",
          className:
            "text-right",

          render: (
            row,
          ) => (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-2xl"
              onClick={() => {
                downloadCsv(
                  row.filename,
                  row.rows,
                );

                toast.success(
                  `${row.name} downloaded.`,
                );
              }}
            >
              <Download className="size-4" />
              Download
            </Button>
          ),
        },
      ],
      [],
    );

  function generateFullReport() {
    if (!stats) {
      toast.error(
        "Report data is not available.",
      );

      return;
    }

    downloadCsv(
      "yourteacher-full-admin-report.csv",
      makeFullReport(
        stats.analytics,
      ),
    );

    toast.success(
      "Full Admin report downloaded.",
    );
  }

  const totals =
    stats?.analytics
      .totals ?? null;

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Reports"
      description="Generate downloadable reports from live YourTeacher database records."
      showNotice={false}
      actions={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={loading}
            onClick={() =>
              void loadReports()
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
            type="button"
            className="rounded-2xl"
            disabled={!stats}
            onClick={
              generateFullReport
            }
          >
            <Plus className="size-4" />
            Generate full report
          </Button>
        </div>
      }
    >
      {loading &&
      !stats ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl border bg-card text-sm text-muted-foreground">
          Loading report data...
        </div>
      ) : null}

      {!loading &&
      error ? (
        <div className="rounded-3xl border bg-card p-6">
          <h2 className="font-semibold">
            Reports unavailable
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <Button
            type="button"
            className="mt-4"
            onClick={() =>
              void loadReports()
            }
          >
            Try again
          </Button>
        </div>
      ) : null}

      {stats &&
      totals ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Available reports"
              value={String(
                reports.length,
              )}
              hint="Generated from live data"
              tone="primary"
            />

            <StatCard
              label="Users represented"
              value={String(
                totals.users,
              )}
              hint={`${totals.students} students · ${totals.teachers} teachers`}
              tone="success"
            />

            <StatCard
              label="Learning content"
              value={String(
                totals.lesson_contents,
              )}
              hint={`${totals.lessons} lessons`}
              tone="primary"
            />

            <StatCard
              label="Media storage"
              value={formatBytes(
                totals.media_storage_bytes,
              )}
              hint={`${totals.media_assets} assets`}
              tone="warning"
            />
          </div>

          <DataTable
            columns={columns}
            rows={reports}
            caption="Available live reports"
          />
        </div>
      ) : null}
    </PortalPage>
  );
}