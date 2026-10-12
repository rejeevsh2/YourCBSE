/**
 * Laravel-backed student data service.
 *
 * Nothing here runs while the mock service is active — it exists so switching
 * to the real backend needs no component changes. Configure the base URL with
 * `VITE_API_BASE_URL` and set `VITE_USE_MOCK_DATA=false`.
 */

import { apiRequest } from "@/lib/auth/http";

import type {
  BookmarkItem,
  DownloadItem,
  StudentNotification,
} from "@/data/student";

import type {
  CalendarEvent,
  LibraryChapter,
  PlannerTask,
  StudentCourse,
} from "@/data/student-library";

import { studentEndpoints } from "./endpoints";

import {
  studentFailure,
  studentSuccess,
  type LibraryState,
  type PracticeHistoryResponse,
  type PracticeReviewResponse,
  type PracticeSetResponse,
  type PracticeSetsResponse,
  type RevisionHubResponse,
  type StartPracticeResponse,
  type FinishInteractiveRevisionResponse,
  type InteractiveRevisionSessionResponse,
  type StartInteractiveRevisionResponse,
  type StudentResult,
  type StudentService,
  type SubmitPracticePayload,
  type SubmitPracticeResponse,
} from "./types";

/**
 * Bridges the shared HTTP client's result shape
 * onto `StudentResult`.
 */
async function request<TData>(
  path: string,
  init: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
): Promise<StudentResult<TData>> {
  const result = await apiRequest<TData>(path, {
    method: init.method ?? "GET",
    body: init.body,
  });

  if (!result.ok) {
    const code =
      result.code === "network-error"
        ? "network-error"
        : result.code === "validation-error"
          ? "validation-error"
          : "server-error";

    return studentFailure(code, result.message);
  }

  if (result.data === undefined) {
    return studentFailure("server-error");
  }

  return studentSuccess(result.data, result.message);
}

export const laravelStudentService: StudentService = {
  /*
  |--------------------------------------------------------------------------
  | Student Library
  |--------------------------------------------------------------------------
  */

  getChapters: () =>
    request<LibraryChapter[]>(
      studentEndpoints.chapters,
    ),

  getChapter: (slug) =>
    request<LibraryChapter>(
      studentEndpoints.chapter(slug),
    ),

  getCourses: () =>
    request<StudentCourse[]>(
      studentEndpoints.courses,
    ),

  getLibraryState: () =>
    request<LibraryState>(
      studentEndpoints.libraryState,
    ),

  toggleBookmark: (chapterId, next) =>
    request<LibraryState>(
      studentEndpoints.bookmarkChapter(chapterId),
      {
        method: next ? "POST" : "DELETE",
      },
    ),

  downloadChapter: (chapterId) =>
    request<LibraryState>(
      studentEndpoints.downloadChapter(chapterId),
      {
        method: "POST",
      },
    ),

  getBookmarks: () =>
    request<BookmarkItem[]>(
      studentEndpoints.bookmarks,
    ),

  getDownloads: () =>
    request<DownloadItem[]>(
      studentEndpoints.downloads,
    ),

  getNotifications: () =>
    request<StudentNotification[]>(
      studentEndpoints.notifications,
    ),

  getPlannerTasks: () =>
    request<PlannerTask[]>(
      studentEndpoints.plannerTasks,
    ),

  setPlannerTaskDone: (taskId, done) =>
    request<string[]>(
      studentEndpoints.plannerTask(taskId),
      {
        method: "PATCH",
        body: {
          done,
        },
      },
    ),

  getCalendarEvents: () =>
    request<CalendarEvent[]>(
      studentEndpoints.calendarEvents,
    ),

  /*
  |--------------------------------------------------------------------------
  | Practice Center
  |--------------------------------------------------------------------------
  */

  /**
   * Get all published practice sets available
   * to the logged-in student.
   */
  getPracticeSets: () =>
    request<PracticeSetsResponse>(
      studentEndpoints.practiceSets,
    ),

  /**
   * Open one practice set with student-safe
   * questions and options.
   */
  getPracticeSet: (id) =>
    request<PracticeSetResponse>(
      studentEndpoints.practiceSet(id),
    ),

  /**
   * Start a new practice attempt.
   */
  startPracticeSet: (id) =>
    request<StartPracticeResponse>(
      studentEndpoints.startPracticeSet(id),
      {
        method: "POST",
      },
    ),

  /**
   * Submit the student's selected answers.
   */
  submitPracticeAttempt: (
    attemptId: number,
    payload: SubmitPracticePayload,
  ) =>
    request<SubmitPracticeResponse>(
      studentEndpoints.submitPracticeAttempt(
        attemptId,
      ),
      {
        method: "POST",
        body: payload,
      },
    ),

  /**
   * Review a completed practice attempt.
   */
  reviewPracticeAttempt: (attemptId) =>
    request<PracticeReviewResponse>(
      studentEndpoints.reviewPracticeAttempt(
        attemptId,
      ),
    ),

  /**
   * Return completed practice history
   * for the logged-in student.
   */
  getPracticeHistory: () =>
    request<PracticeHistoryResponse>(
      studentEndpoints.practiceHistory,
    ),
  /*
  |--------------------------------------------------------------------------
  | Revision Hub
  |--------------------------------------------------------------------------
  */

   getRevisionHub: () =>
    request<RevisionHubResponse>(
      studentEndpoints.revision,
    ),

  /*
  |--------------------------------------------------------------------------
  | Interactive Revision
  |--------------------------------------------------------------------------
  */

  startInteractiveRevision: () =>
    request<StartInteractiveRevisionResponse>(
      studentEndpoints.startInteractiveRevision,
      {
        method: "POST",
      },
    ),

  getInteractiveRevisionSession: (sessionId) =>
    request<InteractiveRevisionSessionResponse>(
      studentEndpoints.interactiveRevisionSession(
        sessionId,
      ),
    ),

  finishInteractiveRevisionSession: (sessionId) =>
    request<FinishInteractiveRevisionResponse>(
      studentEndpoints.finishInteractiveRevisionSession(
        sessionId,
      ),
      {
        method: "POST",
      },
    ),
};