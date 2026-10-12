/**
 * Placeholder student data service used until the Laravel API is live.
 *
 * It fulfils the same `StudentService` contract as the HTTP client, so screens
 * behave identically once the real backend is switched on.
 */

import {
  bookmarks,
  downloads,
  studentNotifications,
} from "@/data/student";

import {
  calendarEvents,
  libraryChapters,
  studentCourses,
  todayPlan,
} from "@/data/student-library";

import {
  studentFailure,
  studentSuccess,
  type FinishInteractiveRevisionResponse,
  type InteractiveRevisionSessionResponse,
  type LibraryState,
  type PracticeHistoryResponse,
  type PracticeReviewResponse,
  type PracticeSetResponse,
  type PracticeSetsResponse,
  type RevisionHubResponse,
  type StartInteractiveRevisionResponse,
  type StartPracticeResponse,
  type StudentResult,
  type StudentService,
  type SubmitPracticePayload,
  type SubmitPracticeResponse,
} from "./types";

/*
|--------------------------------------------------------------------------
| In-memory State
|--------------------------------------------------------------------------
*/

/** In-memory mutable state; the Laravel service persists this server-side. */
const state: LibraryState = {
  bookmarks: libraryChapters
    .filter((chapter) => chapter.bookmarked)
    .map((chapter) => chapter.id),

  downloads: libraryChapters
    .filter((chapter) => chapter.downloaded)
    .map((chapter) => chapter.id),
};

let completedTasks: string[] = todayPlan
  .filter((task) => task.done)
  .map((task) => task.id);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function resolve<TData>(
  data: TData,
): Promise<StudentResult<TData>> {
  return Promise.resolve(
    studentSuccess(data),
  );
}

/*
|--------------------------------------------------------------------------
| Mock Student Service
|--------------------------------------------------------------------------
*/

export const mockStudentService: StudentService = {
  /*
  |--------------------------------------------------------------------------
  | Library
  |--------------------------------------------------------------------------
  */

  getChapters: () =>
    resolve(libraryChapters),

  getChapter: (slug) => {
    const chapter = libraryChapters.find(
      (item) => item.slug === slug,
    );

    return Promise.resolve(
      chapter
        ? studentSuccess(chapter)
        : studentFailure(
            "not-found",
            "Chapter not found.",
          ),
    );
  },

  getCourses: () =>
    resolve(studentCourses),

  getLibraryState: () =>
    resolve({
      ...state,
    }),

  toggleBookmark: (chapterId, next) => {
    state.bookmarks = next
      ? Array.from(
          new Set([
            ...state.bookmarks,
            chapterId,
          ]),
        )
      : state.bookmarks.filter(
          (id) => id !== chapterId,
        );

    return resolve({
      ...state,
    });
  },

  downloadChapter: (chapterId) => {
    state.downloads = Array.from(
      new Set([
        ...state.downloads,
        chapterId,
      ]),
    );

    return resolve({
      ...state,
    });
  },

  getBookmarks: () =>
    resolve(bookmarks),

  getDownloads: () =>
    resolve(downloads),

  getNotifications: () =>
    resolve(studentNotifications),

  getPlannerTasks: () =>
    resolve(todayPlan),

  setPlannerTaskDone: (taskId, done) => {
    completedTasks = done
      ? Array.from(
          new Set([
            ...completedTasks,
            taskId,
          ]),
        )
      : completedTasks.filter(
          (id) => id !== taskId,
        );

    return resolve([
      ...completedTasks,
    ]);
  },

  getCalendarEvents: () =>
    resolve(calendarEvents),

  /*
  |--------------------------------------------------------------------------
  | Practice Center
  |--------------------------------------------------------------------------
  */

  getPracticeSets: (): Promise<
    StudentResult<PracticeSetsResponse>
  > =>
    resolve({
      practice_sets: [],
      count: 0,
    }),

  getPracticeSet: (
    _id: number,
  ): Promise<
    StudentResult<PracticeSetResponse>
  > =>
    Promise.resolve(
      studentFailure(
        "not-found",
        "Practice set is not available in mock mode.",
      ),
    ),

  startPracticeSet: (
    _id: number,
  ): Promise<
    StudentResult<StartPracticeResponse>
  > =>
    Promise.resolve(
      studentFailure(
        "server-error",
        "Practice attempts require the Laravel backend.",
      ),
    ),

  submitPracticeAttempt: (
    _attemptId: number,
    _payload: SubmitPracticePayload,
  ): Promise<
    StudentResult<SubmitPracticeResponse>
  > =>
    Promise.resolve(
      studentFailure(
        "server-error",
        "Practice submission requires the Laravel backend.",
      ),
    ),

  reviewPracticeAttempt: (
    _attemptId: number,
  ): Promise<
    StudentResult<PracticeReviewResponse>
  > =>
    Promise.resolve(
      studentFailure(
        "server-error",
        "Practice review requires the Laravel backend.",
      ),
    ),

  getPracticeHistory: (): Promise<
    StudentResult<PracticeHistoryResponse>
  > =>
    resolve({
      attempts: [],
      count: 0,
    }),

  /*
  |--------------------------------------------------------------------------
  | Revision Hub
  |--------------------------------------------------------------------------
  */

  getRevisionHub: (): Promise<
    StudentResult<RevisionHubResponse>
  > =>
    resolve({
      revision_items: [],
      due_items: [],
      stats: {
        cards_due_today: 0,
        revision_items: 0,
        reviews_completed: 0,
        recall_accuracy: 0,
      },
    }),

  /*
  |--------------------------------------------------------------------------
  | Interactive Revision
  |--------------------------------------------------------------------------
  */

  startInteractiveRevision: (): Promise<
    StudentResult<StartInteractiveRevisionResponse>
  > =>
    Promise.resolve(
      studentFailure(
        "server-error",
        "Interactive revision requires the Laravel backend.",
      ),
    ),

  getInteractiveRevisionSession: (
    _sessionId: number,
  ): Promise<
    StudentResult<InteractiveRevisionSessionResponse>
  > =>
    Promise.resolve(
      studentFailure(
        "not-found",
        "Revision session is not available in mock mode.",
      ),
    ),

  finishInteractiveRevisionSession: (
    _sessionId: number,
  ): Promise<
    StudentResult<FinishInteractiveRevisionResponse>
  > =>
    Promise.resolve(
      studentFailure(
        "server-error",
        "Interactive revision requires the Laravel backend.",
      ),
    ),
};