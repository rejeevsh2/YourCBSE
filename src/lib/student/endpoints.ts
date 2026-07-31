/**
 * Laravel endpoints for the student experience, kept in one place so renaming
 * a route on the backend is a single-line change here.
 */
export const studentEndpoints = {
  chapters: "/student/chapters",
  chapter: (slug: string) => `/student/chapters/${slug}`,
  courses: "/student/courses",
  libraryState: "/student/library",
  bookmarkChapter: (id: string) => `/student/chapters/${id}/bookmark`,
  downloadChapter: (id: string) => `/student/chapters/${id}/download`,
  bookmarks: "/student/bookmarks",
  downloads: "/student/downloads",
  notifications: "/student/notifications",
  plannerTasks: "/student/planner/tasks",
  plannerTask: (id: string) => `/student/planner/tasks/${id}`,
  calendarEvents: "/student/calendar/events",
} as const;
