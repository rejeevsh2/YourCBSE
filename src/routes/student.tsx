import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthToken, getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/student")({
  beforeLoad: () => {
    /*
     * Authentication is currently stored in browser storage.
     *
     * During TanStack Start SSR there is no window/localStorage,
     * so authentication cannot be checked on the server.
     *
     * Allow the server render to continue. The browser will run
     * this guard again during client navigation/hydration where
     * the stored session is available.
     */
    if (typeof window === "undefined") {
      return;
    }

    const token = getAuthToken();
    const user = getStoredUser();

    // Not logged in
    if (!token || !user) {
      throw redirect({
        to: "/login",
      });
    }

    // Admin belongs in Admin Portal
    if (user.role === "admin") {
      throw redirect({
        to: "/admin",
      });
    }

    // Teacher belongs in Teacher Portal
    if (user.role === "teacher") {
      throw redirect({
        to: "/teacher",
      });
    }

    // Only students may continue
    if (user.role !== "student") {
      throw redirect({
        to: "/login",
      });
    }
  },

  head: () => ({
    meta: [
      { title: "Student Portal — YourTeacher" },
      {
        name: "description",
        content:
          "Your CBSE learning dashboard: progress, bookmarks, downloads and more.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),

  component: StudentLayoutRoute,
});

function StudentLayoutRoute() {
  return (
    <PortalLayout portal="student">
      <Outlet />
    </PortalLayout>
  );
}