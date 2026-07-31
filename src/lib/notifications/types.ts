/** Contracts for the notification data layer. */

import type {
  AchievementNotification,
  AppNotification,
  NotificationPreference,
  StudyReminder,
} from "./domain";

export type NotificationErrorCode = "offline" | "failed";

export interface NotificationError {
  code: NotificationErrorCode;
  message: string;
}

export type NotificationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: NotificationError };

export interface NotificationService {
  list(): Promise<NotificationResult<AppNotification[]>>;
  markRead(id: string): Promise<NotificationResult<null>>;
  markAllRead(): Promise<NotificationResult<null>>;
  remove(id: string): Promise<NotificationResult<null>>;
  reminders(): Promise<NotificationResult<StudyReminder[]>>;
  achievements(): Promise<NotificationResult<AchievementNotification[]>>;
  preferences(): Promise<NotificationResult<NotificationPreference[]>>;
  updatePreference(id: string, enabled: boolean): Promise<NotificationResult<null>>;
}

export type { AchievementNotification, AppNotification, NotificationPreference, StudyReminder };
