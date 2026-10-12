/**
 * Laravel endpoints for the student experience, kept in one place so renaming
 * a route on the backend is a single-line change here.
 */
export const studentEndpoints = {
  chapters: "/student/chapters",
  chapter: (slug: string) => `/student/chapters/${slug}`,

  courses: "/student/courses",

  libraryState: "/student/library",

  bookmarkChapter: (id: string) =>
    `/student/chapters/${id}/bookmark`,

  downloadChapter: (id: string) =>
    `/student/chapters/${id}/download`,

  bookmarks: "/student/bookmarks",

  downloads: "/student/downloads",

  notifications: "/student/notifications",

  plannerTasks: "/student/planner/tasks",

  plannerTask: (id: string) =>
    `/student/planner/tasks/${id}`,

  calendarEvents: "/student/calendar/events",

  /*
  |--------------------------------------------------------------------------
  | Practice Center
  |--------------------------------------------------------------------------
  */

  practiceSets: "/practice-sets",

  practiceSet: (id: number) =>
    `/practice-sets/${id}`,

  startPracticeSet: (id: number) =>
    `/practice-sets/${id}/start`,

  practiceHistory: "/practice-attempts/history",

  submitPracticeAttempt: (attemptId: number) =>
    `/practice-attempts/${attemptId}/submit`,

  reviewPracticeAttempt: (attemptId: number) =>
    `/practice-attempts/${attemptId}/review`,
   /*
  |--------------------------------------------------------------------------
  | Revision Hub
  |--------------------------------------------------------------------------
  */

  revision: "/revision",

  /*
  |--------------------------------------------------------------------------
  | Interactive Revision
  |--------------------------------------------------------------------------
  */

  interactiveRevision: "/interactive-revision",

  startInteractiveRevision:
    "/interactive-revision/start",

  interactiveRevisionSession: (sessionId: number) =>
    `/interactive-revision/${sessionId}`,

  finishInteractiveRevisionSession: (sessionId: number) =>
    `/interactive-revision/${sessionId}/finish`,
} as const;