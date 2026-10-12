import { Award, CalendarClock } from "lucide-react";
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
  list: () => request<AppNotification[]>("/notifications/center"),
  markRead: (id) => request<null>(notificationEndpoints.read(id), { method: "PATCH" }),
  markAllRead: () => request<null>(notificationEndpoints.readAll, { method: "PATCH" }),
  remove: (id) => request<null>(notificationEndpoints.item(id), { method: "DELETE" }),
  reminders: async () => {
    const r = await request<StudyReminder[]>(notificationEndpoints.reminders);
    return r.ok ? { ...r, data: r.data.map((item) => ({ ...item, icon: CalendarClock })) } : r;
  },
  achievements: async () => {
    const r = await request<AchievementNotification[]>(notificationEndpoints.achievements);
    return r.ok ? { ...r, data: r.data.map((item) => ({ ...item, icon: Award })) } : r;
  },
  preferences: () => request<NotificationPreference[]>(notificationEndpoints.preferences),
  updatePreference: (id, enabled) =>
    request<null>(notificationEndpoints.preferences, {
      method: "PATCH",
      body: { id, enabled },
    }),
};
