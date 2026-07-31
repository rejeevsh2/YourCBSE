/** Laravel-backed notification service (inactive while mock data is on). */

import { apiRequest } from "@/lib/auth/http";
import { notificationEndpoints } from "./endpoints";
import type {
  AchievementNotification,
  AppNotification,
  NotificationPreference,
  NotificationResult,
  NotificationService,
  StudyReminder,
} from "./types";

async function request<TData>(
  path: string,
  init: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<NotificationResult<TData>> {
  const result = await apiRequest<TData>(path, { method: init.method ?? "GET", body: init.body });
  if (!result.ok) {
    return {
      ok: false,
      error: {
        code: result.code === "network-error" ? "offline" : "failed",
        message: result.message ?? "We could not load your notifications.",
      },
    };
  }
  return { ok: true, data: result.data as TData };
}

export const laravelNotificationService: NotificationService = {
  list: () => request<AppNotification[]>(notificationEndpoints.list),
  markRead: (id) => request<null>(notificationEndpoints.read(id), { method: "POST" }),
  markAllRead: () => request<null>(notificationEndpoints.readAll, { method: "POST" }),
  remove: (id) => request<null>(notificationEndpoints.item(id), { method: "DELETE" }),
  reminders: () => request<StudyReminder[]>(notificationEndpoints.reminders),
  achievements: () => request<AchievementNotification[]>(notificationEndpoints.achievements),
  preferences: () => request<NotificationPreference[]>(notificationEndpoints.preferences),
  updatePreference: (id, enabled) =>
    request<null>(notificationEndpoints.preferences, {
      method: "PATCH",
      body: { id, enabled },
    }),
};
