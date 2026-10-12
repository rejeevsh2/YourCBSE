import {
  useEffect,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  RefreshCw,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import {
  BarChart,
  ChartPanel,
  LineChart,
  RankedBars,
} from "@/components/admin/Charts";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      {
        title: "Analytics — YourTeacher Admin",
      },
      {
        name: "description",
        content:
          "Real platform growth, publishing and content analytics.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminAnalyticsPage,
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

function percentage(
  part: number,
  total: number,
) {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (part / total) * 100,
  );
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

function makeRankedItems(
  items: BreakdownItem[],
) {
  const maximum = Math.max(
    1,
    ...items.map(
      (item) => item.value,
    ),
  );

  return items.map(
    (item, index) => ({
      id: `${item.label}-${index}`,
      label: item.label,
      caption: "Stored records",
      value: String(item.value),
      share: Math.round(
        (item.value / maximum) *
          100,
      ),
    }),
  );
}

function AdminAnalyticsPage() {
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

  async function loadAnalytics() {
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
            "Could not load analytics.",
        );
      }

      setStats(
        result.data,
      );
    } catch (err) {
      console.error(
        "Admin analytics error:",
        err,
      );

      setStats(null);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load analytics.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, []);

  function exportCsv() {
    if (!stats) {
      return;
    }

    const {
      totals,
      monthly,
      recent_30_days,
    } = stats.analytics;

    const rows: Array<
      Array<string | number>
    > = [
      [
        "YourTeacher Admin Analytics",
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
        "Published blog posts",
        totals.published_blog_posts,
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
      [],
      [
        "Recent 30 days",
        "Count",
      ],
      [
        "New students",
        recent_30_days.new_students,
      ],
      [
        "New teachers",
        recent_30_days.new_teachers,
      ],
      [
        "New lessons",
        recent_30_days.new_lessons,
      ],
      [
        "New lesson contents",
        recent_30_days
          .new_lesson_contents,
      ],
      [
        "New blog posts",
        recent_30_days.new_blog_posts,
      ],
      [
        "New media assets",
        recent_30_days.new_media_assets,
      ],
      [
        "New flashcards",
        recent_30_days.new_flashcards,
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
      ...monthly.labels.map(
        (label, index) => [
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
          monthly.media_assets[
            index
          ] ?? 0,
        ],
      ),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value,
              ).replace(
                /"/g,
                '""',
              )}"`,
          )
          .join(","),
      )
      .join("\n");

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
    link.download =
      "yourteacher-admin-analytics.csv";

    document.body.appendChild(
      link,
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const analytics =
    stats?.analytics ?? null;

  const totals =
    analytics?.totals ?? null;

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Analytics"
      description="Real platform growth, content, publishing and storage statistics."
      showNotice={false}
      actions={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={
              loading
            }
            onClick={() =>
              void loadAnalytics()
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
            variant="outline"
            className="rounded-2xl"
            disabled={
              !stats
            }
            onClick={
              exportCsv
            }
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      }
    >
      {loading &&
      !analytics ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl border bg-card text-sm text-muted-foreground">
          Loading real analytics...
        </div>
      ) : null}

      {!loading &&
      error ? (
        <div className="rounded-3xl border bg-card p-6">
          <h2 className="font-semibold">
            Analytics unavailable
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <Button
            type="button"
            className="mt-4"
            onClick={() =>
              void loadAnalytics()
            }
          >
            Try again
          </Button>
        </div>
      ) : null}

      {analytics &&
      totals ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Students"
              value={String(
                totals.students,
              )}
              hint={`${analytics.recent_30_days.new_students} added in last 30 days`}
              tone="primary"
            />

            <StatCard
              label="Teachers"
              value={String(
                totals.teachers,
              )}
              hint={`${analytics.recent_30_days.new_teachers} added in last 30 days`}
              tone="success"
            />

            <StatCard
              label="Lessons"
              value={String(
                totals.lessons,
              )}
              hint={`${totals.published_lessons} published`}
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

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartPanel
              title="Student growth"
              subtitle="New student accounts per month"
            >
              <LineChart
                data={
                  analytics.monthly
                    .students
                }
                labels={
                  analytics.monthly
                    .labels
                }
                ariaLabel="Student growth"
              />
            </ChartPanel>

            <ChartPanel
              title="Teacher growth"
              subtitle="New teacher accounts per month"
            >
              <LineChart
                data={
                  analytics.monthly
                    .teachers
                }
                labels={
                  analytics.monthly
                    .labels
                }
                ariaLabel="Teacher growth"
                stroke="var(--color-success)"
              />
            </ChartPanel>

            <ChartPanel
              title="Lessons created"
              subtitle="New lessons per month"
            >
              <BarChart
                data={
                  analytics.monthly
                    .lessons
                }
                labels={
                  analytics.monthly
                    .labels
                }
                ariaLabel="Lessons created"
              />
            </ChartPanel>

            <ChartPanel
              title="Learning content added"
              subtitle="Lesson-content records per month"
            >
              <BarChart
                data={
                  analytics.monthly
                    .lesson_contents
                }
                labels={
                  analytics.monthly
                    .labels
                }
                tone="success"
                ariaLabel="Learning content added"
              />
            </ChartPanel>

            <ChartPanel
              title="Blog activity"
              subtitle="New blog posts per month"
            >
              <BarChart
                data={
                  analytics.monthly
                    .blog_posts
                }
                labels={
                  analytics.monthly
                    .labels
                }
                tone="warning"
                ariaLabel="Blog activity"
              />
            </ChartPanel>

            <ChartPanel
              title="Media uploads"
              subtitle="Assets uploaded per month"
            >
              <BarChart
                data={
                  analytics.monthly
                    .media_assets
                }
                labels={
                  analytics.monthly
                    .labels
                }
                ariaLabel="Media uploads"
              />
            </ChartPanel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartPanel
              title="Publishing status"
              subtitle="Currently published content"
            >
              <ul className="space-y-5">
                {[
                  {
                    label:
                      "Lessons",
                    ...analytics
                      .publication
                      .lessons,
                  },
                  {
                    label:
                      "Blog posts",
                    ...analytics
                      .publication
                      .blog_posts,
                  },
                  {
                    label:
                      "Flashcard decks",
                    ...analytics
                      .publication
                      .flashcard_decks,
                  },
                ].map(
                  (item) => {
                    const value =
                      percentage(
                        item.published,
                        item.total,
                      );

                    return (
                      <li
                        key={
                          item.label
                        }
                        className="space-y-2"
                      >
                        <div className="flex items-baseline justify-between gap-4 text-sm">
                          <span>
                            {
                              item.label
                            }
                          </span>

                          <span className="font-semibold">
                            {
                              item.published
                            }
                            {" / "}
                            {
                              item.total
                            }
                            {" · "}
                            {
                              value
                            }
                            %
                          </span>
                        </div>

                        <Progress
                          value={
                            value
                          }
                          aria-label={`${item.label} publishing progress`}
                        />
                      </li>
                    );
                  },
                )}
              </ul>
            </ChartPanel>

            <ChartPanel
              title="Last 30 days"
              subtitle="New records created"
            >
              <ul className="divide-y">
                {[
                  [
                    "Students",
                    analytics
                      .recent_30_days
                      .new_students,
                  ],
                  [
                    "Teachers",
                    analytics
                      .recent_30_days
                      .new_teachers,
                  ],
                  [
                    "Lessons",
                    analytics
                      .recent_30_days
                      .new_lessons,
                  ],
                  [
                    "Lesson contents",
                    analytics
                      .recent_30_days
                      .new_lesson_contents,
                  ],
                  [
                    "Blog posts",
                    analytics
                      .recent_30_days
                      .new_blog_posts,
                  ],
                  [
                    "Media assets",
                    analytics
                      .recent_30_days
                      .new_media_assets,
                  ],
                  [
                    "Flashcards",
                    analytics
                      .recent_30_days
                      .new_flashcards,
                  ],
                ].map(
                  ([
                    label,
                    value,
                  ]) => (
                    <li
                      key={
                        label
                      }
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span>
                        {label}
                      </span>

                      <span className="font-semibold">
                        {value}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </ChartPanel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartPanel
              title="Lesson content types"
              subtitle="Current database distribution"
            >
              {analytics
                .content_types
                .length ? (
                <RankedBars
                  ariaLabel="Lesson content types"
                  items={makeRankedItems(
                    analytics.content_types,
                  )}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No lesson content has
                  been created yet.
                </p>
              )}
            </ChartPanel>

            <ChartPanel
              title="Top chapters"
              subtitle="Ranked by stored lesson content"
            >
              {analytics
                .top_chapters
                .length ? (
                <RankedBars
                  ariaLabel="Top chapters by content"
                  items={analytics.top_chapters.map(
                    (
                      chapter,
                    ) => ({
                      id: String(
                        chapter.id,
                      ),
                      label:
                        chapter.title,
                      caption:
                        `${chapter.lessons} lessons`,
                      value:
                        `${chapter.contents} contents`,
                      share:
                        chapter.share,
                    }),
                  )}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No chapter data
                  available.
                </p>
              )}
            </ChartPanel>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Curriculum"
              value={`${totals.grades} grades`}
              hint={`${totals.subjects} subjects · ${totals.chapters} chapters`}
            />

            <StatCard
              label="Lesson content"
              value={String(
                totals.lesson_contents,
              )}
              hint="Stored learning resources"
              tone="primary"
            />

            <StatCard
              label="Flashcards"
              value={String(
                totals.flashcards,
              )}
              hint={`${totals.flashcard_decks} decks`}
              tone="success"
            />

            <StatCard
              label="Notifications"
              value={String(
                totals.notifications,
              )}
              hint={`${totals.unread_notifications} unread`}
              tone="warning"
            />
          </div>
        </div>
      ) : null}
    </PortalPage>
  );
}