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

/*
|--------------------------------------------------------------------------
| Student Result Types
|--------------------------------------------------------------------------
*/

export type StudentErrorCode =
  | "not-found"
  | "validation-error"
  | "network-error"
  | "server-error";

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

export type StudentResult<TData> =
  | StudentSuccess<TData>
  | StudentFailure;

export function studentSuccess<TData>(
  data: TData,
  message?: string,
): StudentSuccess<TData> {
  return {
    ok: true,
    data,
    message,
  };
}

export function studentFailure(
  code: StudentErrorCode,
  message?: string,
): StudentFailure {
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

/*
|--------------------------------------------------------------------------
| Student Library State
|--------------------------------------------------------------------------
*/

/** Ids of chapters the learner has bookmarked / saved offline. */
export interface LibraryState {
  bookmarks: string[];
  downloads: string[];
}

/*
|--------------------------------------------------------------------------
| Practice Center - Content Types
|--------------------------------------------------------------------------
*/

export interface PracticeSubject {
  id: number;
  grade_id: number;
  name: string;
  code: string;
}

export interface PracticeUnit {
  id: number;
  subject_id: number;
  title: string;
  code: string;
}

export interface PracticeChapter {
  id: number;
  unit_id: number;
  title: string;
  code: string;
}

export interface PracticeLesson {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
}

export interface PracticeOption {
  id: number;
  practice_question_id: number;
  option_text: string;
  image_url: string | null;
  display_order: number;
}

export interface PracticeQuestion {
  id: number;
  practice_set_id: number;
  question_text: string;
  question_type: string;
  image_url: string | null;
  difficulty: string;
  marks: string;
  negative_marks: string;
  display_order: number;
  options: PracticeOption[];
}

export interface PracticeSet {
  id: number;

  subject_id: number;
  unit_id: number | null;
  chapter_id: number | null;
  lesson_id: number | null;

  title: string;
  slug: string;
  description: string | null;
  type: string;

  duration_minutes: number | null;

  marks_per_question: string;
  negative_marks: string;

  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_answers_after_submit: boolean;

  is_published: boolean;
  is_active: boolean;

  display_order: number;

  created_at?: string;
  updated_at?: string;

  questions_count?: number;

  subject?: PracticeSubject | null;
  unit?: PracticeUnit | null;
  chapter?: PracticeChapter | null;
  lesson?: PracticeLesson | null;

  questions?: PracticeQuestion[];
}

/*
|--------------------------------------------------------------------------
| Practice Center - API Responses
|--------------------------------------------------------------------------
*/

export interface PracticeSetsResponse {
  practice_sets: PracticeSet[];
  count: number;
}

export interface PracticeSetResponse {
  practice_set: PracticeSet;
}

/*
|--------------------------------------------------------------------------
| Practice Center - Attempts
|--------------------------------------------------------------------------
*/

export interface PracticeAttempt {
  id: number;
  user_id: number;
  practice_set_id: number;

  status: string;

  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;

  score: string;
  max_score: string;
  percentage: string;

  started_at: string;
  submitted_at: string | null;

  time_spent_seconds: number;

  created_at?: string;
  updated_at?: string;
}

export interface StartPracticeResponse {
  message: string;
  attempt: PracticeAttempt;
}

/*
|--------------------------------------------------------------------------
| Practice Center - Submission
|--------------------------------------------------------------------------
*/

export interface PracticeSubmissionAnswer {
  question_id: number;
  option_id: number;
  time_spent_seconds?: number;
}

export interface SubmitPracticePayload {
  answers: PracticeSubmissionAnswer[];
  time_spent_seconds?: number;
}

export interface SubmitPracticeResponse {
  message: string;
  attempt: PracticeAttempt;
}

/*
|--------------------------------------------------------------------------
| Practice Center - Review
|--------------------------------------------------------------------------
*/

export interface PracticeReviewOption {
  id: number;
  text: string;
}

export interface PracticeReviewItem {
  question_id: number;
  question: string;
  question_type: string;

  selected_option: PracticeReviewOption | null;
  correct_option: PracticeReviewOption | null;

  is_correct: boolean;
  marks_awarded: string;
  explanation: string | null;
  time_spent_seconds: number;
}

export interface PracticeReviewAttempt {
  id: number;
  status: string;

  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;

  score: string;
  max_score: string;
  percentage: string;

  started_at: string;
  submitted_at: string | null;

  time_spent_seconds: number;
}

export interface PracticeReviewSet {
  id: number;
  title: string;
  type: string;

  subject: PracticeSubject | null;
  unit: PracticeUnit | null;
  chapter: PracticeChapter | null;
  lesson: PracticeLesson | null;
}

export interface PracticeReviewResponse {
  attempt: PracticeReviewAttempt;
  practice_set: PracticeReviewSet;
  review: PracticeReviewItem[];
}

/*
|--------------------------------------------------------------------------
| Practice Center - History
|--------------------------------------------------------------------------
*/

export interface PracticeHistorySet {
  id: number;
  title: string;
  type: string;

  subject_id: number | null;
  unit_id: number | null;
  chapter_id: number | null;
  lesson_id: number | null;

  subject: PracticeSubject | null;
  unit: PracticeUnit | null;
  chapter: PracticeChapter | null;
  lesson: PracticeLesson | null;
}

export interface PracticeHistoryAttempt extends PracticeAttempt {
  practice_set: PracticeHistorySet | null;
}

export interface PracticeHistoryResponse {
  attempts: PracticeHistoryAttempt[];
  count: number;
}

/*
|--------------------------------------------------------------------------
| Revision Hub
|--------------------------------------------------------------------------
*/

export interface RevisionLesson {
  id: number;
  title: string;
}

export interface RevisionItem {
  id: number;
  user_id: number;
  lesson_id: number;
  type: string;
  title: string;
  content: string | null;
  strength: number;
  review_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  lesson: RevisionLesson | null;
}

export interface RevisionStats {
  cards_due_today: number;
  revision_items: number;
  reviews_completed: number;
  recall_accuracy: number;
}

export interface RevisionHubResponse {
  revision_items: RevisionItem[];
  due_items: RevisionItem[];
  stats: RevisionStats;
}
/*
|--------------------------------------------------------------------------
| Interactive Revision
|--------------------------------------------------------------------------
*/

export interface RevisionSession {
  id: number;
  user_id: number;

  subject_id: number | null;
  chapter_id: number | null;

  mode: string;
  difficulty: string;

  total_cards: number;
  completed_cards: number;
  score: number;

  status: string;

  started_at: string | null;
  finished_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface StartInteractiveRevisionResponse {
  message: string;
  session: RevisionSession;
}

export interface InteractiveRevisionSessionResponse {
  session: RevisionSession;
}

export interface FinishInteractiveRevisionResponse {
  message: string;
  session: RevisionSession;
}

/*
|--------------------------------------------------------------------------
| Student Service
|--------------------------------------------------------------------------
*/

/**
 * Every read/write the student experience performs.
 * Implemented by both the mock and the Laravel HTTP service.
 */
export interface StudentService {
  getChapters(): Promise<StudentResult<LibraryChapter[]>>;

  getChapter(
    slug: string,
  ): Promise<StudentResult<LibraryChapter>>;

  getCourses(): Promise<StudentResult<StudentCourse[]>>;

  getLibraryState(): Promise<StudentResult<LibraryState>>;

  toggleBookmark(
    chapterId: string,
    next: boolean,
  ): Promise<StudentResult<LibraryState>>;

  downloadChapter(
    chapterId: string,
  ): Promise<StudentResult<LibraryState>>;

  getBookmarks(): Promise<StudentResult<BookmarkItem[]>>;

  getDownloads(): Promise<StudentResult<DownloadItem[]>>;

  getNotifications(): Promise<
    StudentResult<StudentNotification[]>
  >;

  getPlannerTasks(): Promise<StudentResult<PlannerTask[]>>;

  setPlannerTaskDone(
    taskId: string,
    done: boolean,
  ): Promise<StudentResult<string[]>>;

  getCalendarEvents(): Promise<
    StudentResult<CalendarEvent[]>
  >;

  /*
  |--------------------------------------------------------------------------
  | Practice Center
  |--------------------------------------------------------------------------
  */

  getPracticeSets(): Promise<
    StudentResult<PracticeSetsResponse>
  >;

  getPracticeSet(
    id: number,
  ): Promise<StudentResult<PracticeSetResponse>>;

  startPracticeSet(
    id: number,
  ): Promise<StudentResult<StartPracticeResponse>>;

  submitPracticeAttempt(
    attemptId: number,
    payload: SubmitPracticePayload,
  ): Promise<StudentResult<SubmitPracticeResponse>>;

  reviewPracticeAttempt(
    attemptId: number,
  ): Promise<StudentResult<PracticeReviewResponse>>;
 getPracticeHistory(): Promise<
    StudentResult<PracticeHistoryResponse>
  >;
    /*
  |--------------------------------------------------------------------------
  | Revision Hub
  |--------------------------------------------------------------------------
  */

  getRevisionHub(): Promise<
    StudentResult<RevisionHubResponse>
  >;

  /*
  |--------------------------------------------------------------------------
  | Interactive Revision
  |--------------------------------------------------------------------------
  */

  startInteractiveRevision(): Promise<
    StudentResult<StartInteractiveRevisionResponse>
  >;

  getInteractiveRevisionSession(
    sessionId: number,
  ): Promise<
    StudentResult<InteractiveRevisionSessionResponse>
  >;

  finishInteractiveRevisionSession(
    sessionId: number,
  ): Promise<
    StudentResult<FinishInteractiveRevisionResponse>
  >;
}
