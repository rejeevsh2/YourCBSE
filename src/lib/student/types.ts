/**
 * Student data contracts.
 *
 * These types are the boundary between the student UI and whichever data
 * implementation is active (placeholder data today, Laravel API later), so
 * routes and components never depend on transport details.
 */

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

export type StudentErrorCode = "not-found" | "validation-error" | "network-error" | "server-error";

export interface StudentSuccess<TData> {
  ok: true;
  data: TData;
  message?: string;
}

export interface StudentFailure {
  ok: false;
  code: StudentErrorCode;
  message: string;
}

export type StudentResult<TData> = StudentSuccess<TData> | StudentFailure;

export function studentSuccess<TData>(data: TData, message?: string): StudentSuccess<TData> {
  return { ok: true, data, message };
}

export function studentFailure(code: StudentErrorCode, message?: string): StudentFailure {
  return {
    ok: false,
    code,
    message: message ?? defaultMessages[code],
  };
}

const defaultMessages: Record<StudentErrorCode, string> = {
  "not-found": "We couldn't find that item.",
  "validation-error": "Please check the details and try again.",
  "network-error": "Network unavailable. Check your connection and retry.",
  "server-error": "Something went wrong on our side. Please try again.",
};

/** Ids of chapters the learner has bookmarked / saved offline. */
export interface LibraryState {
  bookmarks: string[];
  downloads: string[];
}

/**
 * Every read/write the student experience performs.
 * Implemented by both the mock and the Laravel HTTP service.
 */
export interface StudentService {
  getChapters(): Promise<StudentResult<LibraryChapter[]>>;
  getChapter(slug: string): Promise<StudentResult<LibraryChapter>>;
  getCourses(): Promise<StudentResult<StudentCourse[]>>;
  getLibraryState(): Promise<StudentResult<LibraryState>>;
  toggleBookmark(chapterId: string, next: boolean): Promise<StudentResult<LibraryState>>;
  downloadChapter(chapterId: string): Promise<StudentResult<LibraryState>>;
  getBookmarks(): Promise<StudentResult<BookmarkItem[]>>;
  getDownloads(): Promise<StudentResult<DownloadItem[]>>;
  getNotifications(): Promise<StudentResult<StudentNotification[]>>;
  getPlannerTasks(): Promise<StudentResult<PlannerTask[]>>;
  setPlannerTaskDone(taskId: string, done: boolean): Promise<StudentResult<string[]>>;
  getCalendarEvents(): Promise<StudentResult<CalendarEvent[]>>;
}
