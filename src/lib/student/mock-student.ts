/**
 * Placeholder student data service used until the Laravel API is live.
 *
 * It fulfils the same `StudentService` contract as the HTTP client, so screens
 * behave identically once the real backend is switched on.
 */

import { bookmarks, downloads, studentNotifications } from "@/data/student";
import {
  calendarEvents,
  libraryChapters,
  studentCourses,
  todayPlan,
} from "@/data/student-library";
import {
  studentFailure,
  studentSuccess,
  type LibraryState,
  type StudentResult,
  type StudentService,
} from "./types";

/** In-memory mutable state; the Laravel service persists this server-side. */
const state: LibraryState = {
  bookmarks: libraryChapters.filter((chapter) => chapter.bookmarked).map((chapter) => chapter.id),
  downloads: libraryChapters.filter((chapter) => chapter.downloaded).map((chapter) => chapter.id),
};

let completedTasks: string[] = todayPlan.filter((task) => task.done).map((task) => task.id);

function resolve<TData>(data: TData): Promise<StudentResult<TData>> {
  return Promise.resolve(studentSuccess(data));
}

export const mockStudentService: StudentService = {
  getChapters: () => resolve(libraryChapters),

  getChapter: (slug) => {
    const chapter = libraryChapters.find((item) => item.slug === slug);
    return Promise.resolve(
      chapter ? studentSuccess(chapter) : studentFailure("not-found", "Chapter not found."),
    );
  },

  getCourses: () => resolve(studentCourses),

  getLibraryState: () => resolve({ ...state }),

  toggleBookmark: (chapterId, next) => {
    state.bookmarks = next
      ? Array.from(new Set([...state.bookmarks, chapterId]))
      : state.bookmarks.filter((id) => id !== chapterId);
    return resolve({ ...state });
  },

  downloadChapter: (chapterId) => {
    state.downloads = Array.from(new Set([...state.downloads, chapterId]));
    return resolve({ ...state });
  },

  getBookmarks: () => resolve(bookmarks),
  getDownloads: () => resolve(downloads),
  getNotifications: () => resolve(studentNotifications),
  getPlannerTasks: () => resolve(todayPlan),

  setPlannerTaskDone: (taskId, done) => {
    completedTasks = done
      ? Array.from(new Set([...completedTasks, taskId]))
      : completedTasks.filter((id) => id !== taskId);
    return resolve([...completedTasks]);
  },

  getCalendarEvents: () => resolve(calendarEvents),
};
