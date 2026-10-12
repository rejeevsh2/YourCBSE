/** Laravel routes for the notification module. */
export const notificationEndpoints = {
  list: "/notifications",
  item: (id: string) => `/notifications/${id}`,
  read: (id: string) => `/notifications/${id}/read`,
  readAll: "/notifications/read-all",
  reminders: "/notifications/reminders",
  achievements: "/notifications/achievements",
  preferences: "/notifications/preferences",
} as const;

