import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { NotificationCategory } from "@/data/notification-center";
import {
  notificationService,
  type AppNotification,
  type NotificationError,
  type NotificationPreference,
  type StudyReminder,
  type AchievementNotification,
} from "@/lib/notifications";

export type CategoryFilter = NotificationCategory | "All";

/** Loads notifications + preferences and exposes optimistic mutations. */
export function useNotificationCenter() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [achievements, setAchievements] = useState<AchievementNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NotificationError | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [list, prefs, reminderData, achievementData] = await Promise.all([
      notificationService.list(),
      notificationService.preferences(),
      notificationService.reminders(),
      notificationService.achievements(),
    ]);
    if (!list.ok) {
      setError(list.error);
      setLoading(false);
      return;
    }
    setItems(list.data);
    if (prefs.ok) setPreferences(prefs.data);
    if (reminderData.ok) setReminders(reminderData.data);
    if (achievementData.ok) setAchievements(achievementData.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = useCallback(async (id: string) => {
    const result = await notificationService.markRead(id);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "read" as const } : item)),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    const result = await notificationService.markAllRead();
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setItems((current) => current.map((item) => ({ ...item, status: "read" as const })));
    toast.success("All notifications marked as read");
  }, []);

  const remove = useCallback(
    async (id: string) => {
      const snapshot = items;
      setItems((current) => current.filter((item) => item.id !== id));
      const result = await notificationService.remove(id);
      if (!result.ok) {
        setItems(snapshot);
        toast.error("Could not delete that notification");
        return;
      }
      toast.success("Notification deleted");
    },
    [items],
  );

  const togglePreference = useCallback(async (id: string, enabled: boolean) => {
    const result = await notificationService.updatePreference(id, enabled);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setPreferences((current) =>
      current.map((item) => (item.id === id ? { ...item, enabled } : item)),
    );
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (unreadOnly && item.status !== "unread") return false;
      return true;
    });
  }, [category, items, unreadOnly]);

  const counts = useMemo(() => {
    const map = new Map<CategoryFilter, number>();
    map.set("All", items.length);
    for (const item of items) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const unreadCount = items.filter((item) => item.status === "unread").length;

  return {
    reminders,
    achievements,
    items,
    filtered,
    counts,
    unreadCount,
    preferences,
    loading,
    error,
    category,
    setCategory,
    unreadOnly,
    setUnreadOnly,
    retry: load,
    markRead,
    markAllRead,
    remove,
    togglePreference,
  };
}
