/** Single entry point for notification data. */

import { laravelNotificationService } from "./laravel-notifications";
import { mockNotificationService } from "./mock-notifications";
import type { NotificationService } from "./types";

const useMock = (import.meta.env.VITE_USE_MOCK_DATA as string | undefined) === "true";

export const notificationService: NotificationService = useMock
  ? mockNotificationService
  : laravelNotificationService;

export const isMockNotifications = useMock;

export { notificationEndpoints } from "./endpoints";
export * from "./types";

