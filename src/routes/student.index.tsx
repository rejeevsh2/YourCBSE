import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Download,
  Flame,
  History,
  PlayCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { BarChart } from "@/components/admin/Charts";
import { StreakHeatmap } from "@/components/student/StreakHeatmap";
import { LaunchCard, LaunchGrid } from "@/components/student/LaunchCard";
import { QuickActions } from "@/components/student/QuickActions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  continueLearning,
  downloadIcons,
  downloads,
  learner,
  notificationIcons,
  recentActivity,
  recommendedChapters,
  revisionTiles,
  streakCalendar,
  studentNotifications,
  upcomingTests,
  weekLabels,
  weeklyMinutes,
} from "@/data/student";
import { difficultyTone, libraryChapters, studentCourses } from "@/data/student-library";


export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — YourCBSE" },
      { name: "description", content: "Your daily goal, streak, recommendations and upcoming tests." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentDashboard,
});

const activityTone = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
} as const;

/* Derived from static placeholder data — computed once, not on every render.
   These become memoised selectors over API data during Laravel integration. */
const goalPercent = Math.round((learner.minutesToday / learner.dailyGoalMinutes) * 100);
const xpPercent = Math.round((learner.xp / learner.nextLevelXp) * 100);
const unread = studentNotifications.filter((item) => item.unread).length;
const overall = Math.round(
  studentCourses.reduce((sum, course) => sum + course.progress, 0) / studentCourses.length,
);
const weeklyTotal = weeklyMinutes.reduce((sum, minutes) => sum + minutes, 0);
const recentChapters = libraryChapters.filter((chapter) => chapter.lastOpened).slice(0, 4);
const recentDownloads = downloads.slice(0, 4);
const notificationPreview = studentNotifications.slice(0, 4);

function StudentDashboard() {



  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title={`Good evening, ${learner.name}`}
      description={`${learner.grade} · ${learner.board} — you're ${learner.dailyGoalMinutes - learner.minutesToday} minutes away from today's goal.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link to="/student/notifications">
              <Bell className="size-4" /> Notifications
              {unread ? (
                <Badge variant="secondary" className="ml-1 rounded-full text-[10px]">
                  {unread}
                </Badge>
              ) : null}
            </Link>
          </Button>
          <Button className="rounded-2xl" asChild>
            <Link to="/student/continue-learning">
              <PlayCircle className="size-4" /> Resume learning
            </Link>
          </Button>
        </div>
      }
    >
      {/* Profile summary */}
      <section className="tile flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar className="size-14">
          <AvatarFallback className="bg-accent text-lg font-bold text-accent-foreground">
            AS
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-bold">Ananya Sharma</h2>
          <p className="text-sm text-muted-foreground">
            {learner.grade} · {learner.board} · Delhi Public School
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-center sm:gap-6">
          <div>
            <dt className="text-xs text-muted-foreground">Overall</dt>
            <dd className="font-heading text-lg font-bold">{overall}%</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Streak</dt>
            <dd className="font-heading text-lg font-bold">{learner.streak}d</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Level</dt>
            <dd className="font-heading text-lg font-bold">{learner.level}</dd>
          </div>
        </dl>
        <Button variant="outline" className="rounded-2xl" asChild>
          <Link to="/student/profile">View profile</Link>
        </Button>
      </section>

      {/* Quick actions */}
      <section className="space-y-3" aria-label="Quick actions">
        <h2 className="font-heading text-lg font-bold">Quick actions</h2>
        <QuickActions />
      </section>

      {/* Goal · streak · level */}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="tile space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-base font-bold">Today's goal</h2>
          </div>
          <p className="font-heading text-4xl font-bold">
            {learner.minutesToday}
            <span className="text-lg text-muted-foreground"> / {learner.dailyGoalMinutes} min</span>
          </p>
          <Progress value={goalPercent} aria-label="Daily goal progress" />
          <p className="text-sm text-muted-foreground">
            {goalPercent}% complete — one more lesson closes it out.
          </p>
        </section>

        <section className="tile space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-warning" aria-hidden="true" />
            <h2 className="font-heading text-base font-bold">Study streak</h2>
          </div>
          <p className="font-heading text-4xl font-bold">
            {learner.streak}
            <span className="text-lg text-muted-foreground"> days</span>
          </p>
          <BarChart data={weeklyMinutes} labels={weekLabels} height="h-20" ariaLabel="Minutes studied this week" />
          <p className="text-sm text-muted-foreground">Longest run: {learner.longestStreak} days.</p>
        </section>

        <section className="tile space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-base font-bold">Level {learner.level}</h2>
          </div>
          <p className="font-heading text-4xl font-bold">
            {learner.xp.toLocaleString()}
            <span className="text-lg text-muted-foreground"> XP</span>
          </p>
          <Progress value={xpPercent} aria-label="Level progress" />
          <p className="text-sm text-muted-foreground">
            {(learner.nextLevelXp - learner.xp).toLocaleString()} XP to level {learner.level + 1}.
          </p>
        </section>
      </div>

      {/* Continue learning */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold">Continue learning</h2>
          <Button variant="ghost" size="sm" className="rounded-2xl" asChild>
            <Link to="/student/continue-learning">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {continueLearning.map((item) => (
            <article key={item.id} className="tile tile-interactive space-y-4 p-5">
              <div>
                <p className="text-xs text-muted-foreground">{item.meta}</p>
                <h3 className="font-heading text-base font-bold">{item.title}</h3>
              </div>
              <Progress value={item.progress} aria-label={`${item.title} progress`} />
              <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                <span>{item.progress}% complete</span>
                <span>{item.minutesLeft} min left</span>
              </div>
              <p className="text-sm">Next: {item.nextUp}</p>
              <Button size="sm" className="w-full rounded-2xl">
                <PlayCircle className="size-4" /> Resume
              </Button>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recommended */}
        <section className="space-y-4 lg:col-span-2">
          <h2 className="font-heading text-lg font-bold">Recommended for you</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {recommendedChapters.map((chapter) => (
              <li key={chapter.id} className="tile tile-interactive space-y-3 p-5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{chapter.subject}</p>
                    <h3 className="font-heading text-sm font-bold">{chapter.title}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 rounded-full text-[11px]", difficultyTone[chapter.difficulty])}
                  >
                    {chapter.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{chapter.reason}</p>
                <p className="text-xs text-muted-foreground">{chapter.minutes} min read</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-4">
          <StudioPanel title="Upcoming tests" icon={CalendarClock}>
            <ul className="space-y-4">
              {upcomingTests.map((test) => (
                <li key={test.id} className="flex gap-3">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <span className="font-heading text-sm font-bold">{test.date}</span>
                    <span className="text-[10px] tracking-wide uppercase">{test.day}</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate text-sm font-semibold">{test.title}</p>
                    <p className="text-xs text-muted-foreground">{test.meta}</p>
                    <Progress value={test.readiness} aria-label={`${test.title} readiness`} />
                    <p className="text-[11px] text-muted-foreground">Readiness {test.readiness}%</p>
                  </div>
                </li>
              ))}
            </ul>
          </StudioPanel>

          <StudioPanel title="Study streak map" icon={Flame}>
            <StreakHeatmap days={streakCalendar} />
          </StudioPanel>
        </div>
      </div>

      {/* Weekly + overall progress */}
      <div className="grid gap-4 lg:grid-cols-3">
        <StudioPanel title="Weekly progress" icon={TrendingUp} className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">
            {Math.floor(weeklyTotal / 60)} h {weeklyTotal % 60} m studied over the last seven days.
          </p>
          <BarChart
            data={weeklyMinutes}
            labels={weekLabels}
            height="h-32"
            ariaLabel="Minutes studied each day this week"
          />
        </StudioPanel>

        <StudioPanel title="Overall progress" icon={Target}>
          <p className="font-heading text-4xl font-bold">{overall}%</p>
          <Progress value={overall} aria-label="Overall syllabus progress" />
          <ul className="space-y-3">
            {studentCourses.slice(0, 4).map((course) => (
              <li key={course.id} className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium">{course.subject}</span>
                  <span className="text-muted-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} aria-label={`${course.subject} progress`} />
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>

      {/* Recently opened chapters */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold">Recently opened chapters</h2>
          <Button variant="ghost" size="sm" className="rounded-2xl" asChild>
            <Link to="/student/learning-hub">
              Learning Hub <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recentChapters.map((chapter) => (
            <li key={chapter.id} className="tile tile-interactive space-y-3 p-5">
              <p className="text-xs text-muted-foreground">{chapter.subject}</p>
              <h3 className="font-heading text-sm font-bold">
                <Link
                  to="/student/chapter/$chapterSlug"
                  params={{ chapterSlug: chapter.slug }}
                  className="hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {chapter.title}
                </Link>
              </h3>
              <Progress value={chapter.completion} aria-label={`${chapter.title} progress`} />
              <p className="text-xs text-muted-foreground">
                {chapter.completion}% · opened {chapter.lastOpened}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick revision */}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold">Jump back in</h2>
          <Button variant="ghost" size="sm" className="rounded-2xl" asChild>
            <Link to="/student/revision">
              Revision Hub <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <LaunchGrid>
          {revisionTiles.slice(0, 3).map((tile) => (
            <LaunchCard key={tile.id} {...tile} />
          ))}
        </LaunchGrid>
      </section>

      {/* Downloads + notifications */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StudioPanel
          title="Recent downloads"
          icon={Download}
          action={
            <Button variant="ghost" size="sm" className="rounded-2xl" asChild>
              <Link to="/student/downloads">
                All <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {recentDownloads.map((item) => {
              const Icon = downloadIcons[item.kind];
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subject} · {item.size} · {item.downloadedOn}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </StudioPanel>

        <StudioPanel
          title="Notifications"
          icon={Bell}
          action={
            <Button variant="ghost" size="sm" className="rounded-2xl" asChild>
              <Link to="/student/notifications">
                All <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {notificationPreview.map((item) => {
              const Icon = notificationIcons[item.kind];
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  {item.unread ? (
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-primary">
                      <span className="sr-only">Unread</span>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </StudioPanel>
      </div>

      {/* Activity */}
      <StudioPanel title="Recent activity" icon={History}>

        <ul className="space-y-4">
          {recentActivity.map((entry) => {
            const Icon = entry.icon;
            return (
              <li key={entry.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-2xl",
                    activityTone[entry.tone],
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{entry.text}</p>
                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </StudioPanel>
    </PortalPage>
  );
}
