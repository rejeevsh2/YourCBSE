/** In-memory notification service with simulated latency. */

import {
  achievementNotices,
  appNotifications,
  notificationPreferences,
  studyReminders,
} from "@/data/notification-center";
import type { AppNotification, NotificationPreference, NotificationResult, NotificationService } from "./types";

let notifications: AppNotification[] = appNotifications.map((item) => ({ ...item }));
let preferences: NotificationPreference[] = notificationPreferences.map((item) => ({ ...item }));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = <T,>(data: T): NotificationResult<T> => ({ ok: true, data });

export const mockNotificationService: NotificationService = {
  async list() {
    await wait(240);
    return ok(notifications.map((item) => ({ ...item })));
  },

  async markRead(id) {
    await wait(90);
    notifications = notifications.map((item) =>
      item.id === id ? { ...item, status: "read" as const } : item,
    );
    return ok(null);
  },

  async markAllRead() {
    await wait(140);
    notifications = notifications.map((item) => ({ ...item, status: "read" as const }));
    return ok(null);
  },

  async remove(id) {
    await wait(90);
    notifications = notifications.filter((item) => item.id !== id);
    return ok(null);
  },

  async reminders() {
    await wait(160);
    return ok(studyReminders);
  },

  async achievements() {
    await wait(160);
    return ok(achievementNotices);
  },

  async preferences() {
    await wait(120);
    return ok(preferences.map((item) => ({ ...item })));
  },

  async updatePreference(id, enabled) {
    await wait(80);
    preferences = preferences.map((item) => (item.id === id ? { ...item, enabled } : item));
    return ok(null);
  },
};
