import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, GraduationCap } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { studentCourses } from "@/data/student-library";

export const Route = createFileRoute("/student/courses")({
  head: () => ({
    meta: [
      { title: "My Courses — YourCBSE" },
      { name: "description", content: "Track progress across every subject you are enrolled in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CoursesPage,
});

const tones = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/12 text-destructive",
} as const;

function CoursesPage() {
  const chapters = studentCourses.reduce((sum, course) => sum + course.chapters, 0);
  const chaptersDone = studentCourses.reduce((sum, course) => sum + course.chaptersDone, 0);
  const lessonsDone = studentCourses.reduce((sum, course) => sum + course.lessonsDone, 0);
  const overall = Math.round(
    studentCourses.reduce((sum, course) => sum + course.progress, 0) / studentCourses.length,
  );

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="My courses"
      description="Five enrolled subjects for Class 10 CBSE — pick a subject to continue."
      actions={
        <Button className="rounded-2xl" asChild>
          <Link to="/student/learning-hub">
            <BookOpenCheck className="size-4" /> Browse Learning Hub
          </Link>
        </Button>
      }
    >
      <StatGrid
        items={[
          { label: "Subjects enrolled", value: String(studentCourses.length), hint: "Class 10 CBSE" },
          { label: "Chapters completed", value: `${chaptersDone} / ${chapters}`, hint: "Across all subjects", tone: "success" },
          { label: "Lessons completed", value: String(lessonsDone), hint: "Videos + interactives", tone: "primary" },
          { label: "Overall progress", value: `${overall}%`, hint: "Weighted average", tone: "warning" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {studentCourses.map((course) => {
          const Icon = course.icon;
          return (
            <article key={course.id} className="tile tile-interactive space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                    tones[course.tone],
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-base font-bold">{course.subject}</h2>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <GraduationCap className="size-3.5" aria-hidden="true" /> {course.teacher}
                  </p>
                </div>
                <span className="font-heading text-lg font-bold">{course.progress}%</span>
              </div>

              <Progress value={course.progress} aria-label={`${course.subject} progress`} />

              <dl className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <dt>Chapters</dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {course.chaptersDone} / {course.chapters}
                  </dd>
                </div>
                <div>
                  <dt>Lessons</dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {course.lessonsDone} / {course.lessons}
                  </dd>
                </div>
              </dl>

              <p className="text-sm">
                <span className="text-muted-foreground">Up next: </span>
                {course.nextChapter}
              </p>

              <Button asChild variant="outline" className="w-full rounded-2xl">
                <Link to="/student/learning-hub">
                  Open subject <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
    </PortalPage>
  );
}
