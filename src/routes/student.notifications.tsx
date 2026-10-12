import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useState } from "react";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  Loader2,
  RefreshCw,
  Settings2,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getAuthToken } from "@/lib/auth";

const AUTH_API = API_BASE_URL;

type NotificationItem = {
  id: string;
  type: string;
  data: {
    title?: string;
    message?: string;
    type?: string;
    link?: string | null;
  };
  read: boolean;
  read_at: string | null;
  created_at: string | null;
  time: string | null;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};

type NotificationPreference = {
  id: string;
  label: string;
  hint: string;
  enabled: boolean;
  group: string;
};

export const Route = createFileRoute(
  "/student/notifications",
)({
  head: () => ({
    meta: [
      {
        title:
          "Notifications — YourSchool",
      },
      {
        name: "description",
        content:
          "New lessons, test reminders, assignments and achievements.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [markingAll, setMarkingAll] =
    useState(false);

  const [
    preferences,
    setPreferences,
  ] = useState<NotificationPreference[]>([]);

  const [
    preferencesLoading,
    setPreferencesLoading,
  ] = useState(true);

  const [
    preferenceSavingId,
    setPreferenceSavingId,
  ] = useState<string | null>(null);

  const [
    preferenceError,
    setPreferenceError,
  ] = useState("");

  async function loadNotifications() {
    const token = getAuthToken();

    if (!token) {
      setError(
        "Your login session is unavailable.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${AUTH_API}/notifications`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not load notifications.",
        );
      }

      const data: NotificationsResponse =
        await response.json();

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : [],
      );

      setUnreadCount(
        typeof data.unreadCount === "number"
          ? data.unreadCount
          : 0,
      );
    } catch (err) {
      console.error(
        "Notifications error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPreferences() {
    const token = getAuthToken();

    if (!token) {
      setPreferencesLoading(false);
      setPreferenceError(
        "Your login session is unavailable.",
      );
      return;
    }

    setPreferencesLoading(true);
    setPreferenceError("");

    try {
      const response = await fetch(
        `${AUTH_API}/notifications/preferences`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not load notification preferences.",
        );
      }

      const data =
        (await response.json()) as unknown;

      setPreferences(
        Array.isArray(data)
          ? (data as NotificationPreference[])
          : [],
      );
    } catch (err) {
      console.error(
        "Notification preferences error:",
        err,
      );

      setPreferenceError(
        err instanceof Error
          ? err.message
          : "Unable to load notification preferences.",
      );
    } finally {
      setPreferencesLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
    void loadPreferences();
  }, []);

  async function updatePreference(
    preferenceId: string,
    enabled: boolean,
  ) {
    const token = getAuthToken();

    if (!token || preferenceSavingId) {
      return;
    }

    setPreferenceSavingId(
      preferenceId,
    );

    setPreferenceError("");

    try {
      const response = await fetch(
        `${AUTH_API}/notifications/preferences`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: preferenceId,
            enabled,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not save notification preference.",
        );
      }

      setPreferences((current) =>
        current.map((preference) =>
          preference.id === preferenceId
            ? {
                ...preference,
                enabled,
              }
            : preference,
        ),
      );
    } catch (err) {
      console.error(
        "Save notification preference error:",
        err,
      );

      setPreferenceError(
        err instanceof Error
          ? err.message
          : "Unable to save notification preference.",
      );
    } finally {
      setPreferenceSavingId(null);
    }
  }

  async function markNotificationAsRead(
    notificationId: string,
  ) {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${AUTH_API}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not mark notification as read.",
        );
      }

      const data =
        await response.json();

      setNotifications((current) =>
        current.map((notification) =>
          notification.id ===
          notificationId
            ? {
                ...notification,
                read: true,
                read_at:
                  notification.read_at ??
                  new Date().toISOString(),
              }
            : notification,
        ),
      );

      setUnreadCount(
        typeof data.unreadCount ===
          "number"
          ? data.unreadCount
          : 0,
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err,
      );
    }
  }

  async function markAllAsRead() {
    const token = getAuthToken();

    if (
      !token ||
      markingAll ||
      unreadCount === 0
    ) {
      return;
    }

    setMarkingAll(true);

    try {
      const response = await fetch(
        `${AUTH_API}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not mark all notifications as read.",
        );
      }

      const data =
        await response.json();

      setNotifications((current) =>
        current.map(
          (notification) => ({
            ...notification,
            read: true,
            read_at:
              notification.read_at ??
              new Date().toISOString(),
          }),
        ),
      );

      setUnreadCount(
        typeof data.unreadCount ===
          "number"
          ? data.unreadCount
          : 0,
      );
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err,
      );
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleNotificationClick(
    item: NotificationItem,
  ) {
    if (!item.read) {
      await markNotificationAsRead(
        item.id,
      );
    }

    if (item.data.link) {
      void navigate({
        to: item.data.link,
      });
    }
  }

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Notifications"
      showNotice={false}
      description={`${unreadCount} unread ${
        unreadCount === 1
          ? "update"
          : "updates"
      } about your lessons and progress.`}
      actions={
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          disabled={
            loading ||
            markingAll ||
            unreadCount === 0
          }
          onClick={() =>
            void markAllAsRead()
          }
        >
          {markingAll ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCheck className="size-4" />
          )}

          {markingAll
            ? "Marking..."
            : "Mark all read"}
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <section className="tile flex items-center justify-center gap-3 p-12">
              <Loader2 className="size-5 animate-spin" />

              <p className="text-sm text-muted-foreground">
                Loading notifications...
              </p>
            </section>
          ) : null}

          {!loading && error ? (
            <section className="tile p-10 text-center">
              <Bell className="mx-auto size-10 text-muted-foreground" />

              <h2 className="mt-4 font-heading text-lg font-bold">
                Notifications unavailable
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {error}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-5 rounded-2xl"
                onClick={() =>
                  void loadNotifications()
                }
              >
                <RefreshCw className="size-4" />
                Try again
              </Button>
            </section>
          ) : null}

          {!loading &&
          !error &&
          notifications.length === 0 ? (
            <section className="tile p-10 text-center">
              <Bell className="mx-auto size-10 text-muted-foreground" />

              <h2 className="mt-4 font-heading text-lg font-bold">
                No notifications yet
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                New lesson updates and
                reminders will appear here.
              </p>
            </section>
          ) : null}

          {!loading &&
          !error &&
          notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.map(
                (item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "tile tile-interactive flex cursor-pointer gap-4 p-5",
                      !item.read &&
                        "border-primary/30",
                    )}
                    onClick={() =>
                      void handleNotificationClick(
                        item,
                      )
                    }
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <Bell
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-sm font-bold">
                          {item.data.title ??
                            "Notification"}
                        </h3>

                        {!item.read ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full text-[10px]"
                          >
                            New
                          </Badge>
                        ) : null}
                      </div>

                      {item.data.message ? (
                        <p className="text-sm text-muted-foreground">
                          {
                            item.data
                              .message
                          }
                        </p>
                      ) : null}

                      <p className="text-xs text-muted-foreground">
                        {item.data.type ??
                          "general"}
                        {" · "}
                        {item.time ??
                          "Recently"}
                      </p>
                    </div>
                  </li>
                ),
              )}
            </ul>
          ) : null}
        </div>

        <StudioPanel
          title="Preferences"
          icon={Settings2}
          className="h-fit"
        >
          {preferencesLoading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading preferences...
            </div>
          ) : null}

          {!preferencesLoading &&
          preferenceError ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                {preferenceError}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void loadPreferences()
                }
              >
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          ) : null}

          {!preferencesLoading &&
          !preferenceError ? (
            <ul className="space-y-4">
              {preferences.map(
                (preference) => (
                  <li
                    key={preference.id}
                    className="flex items-center gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <Label
                        htmlFor={
                          preference.id
                        }
                        className="text-sm font-medium"
                      >
                        {
                          preference.label
                        }
                      </Label>

                      <p className="text-xs text-muted-foreground">
                        {
                          preference.hint
                        }
                      </p>
                    </div>

                    <Switch
                      id={preference.id}
                      checked={
                        preference.enabled
                      }
                      disabled={
                        preferenceSavingId !==
                        null
                      }
                      onCheckedChange={(
                        checked,
                      ) => {
                        void updatePreference(
                          preference.id,
                          checked,
                        );
                      }}
                    />
                  </li>
                ),
              )}
            </ul>
          ) : null}
        </StudioPanel>
      </div>
    </PortalPage>
  );
}