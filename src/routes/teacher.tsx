import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthToken, getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/teacher")({
  beforeLoad: () => {
    /*
     * Authentication is stored in browser storage.
     *
     * During TanStack Start SSR there is no window/localStorage,
     * so authentication cannot be checked on the server.
     *
     * Allow SSR to continue and perform the authentication
     * check when this guard runs in the browser.
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

    // Student belongs in Student Portal
    if (user.role === "student") {
      throw redirect({
        to: "/student",
      });
    }

    // Only teachers may continue
    if (user.role !== "teacher") {
      throw redirect({
        to: "/login",
      });
    }
  },

  head: () => ({
    meta: [
      { title: "Teacher Portal — YourSchool" },
      {
        name: "description",
        content:
          "Manage subjects, chapters, resources and student progress.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),

  component: TeacherLayoutRoute,
});

function TeacherLayoutRoute() {
  return (
    <PortalLayout portal="teacher">
      <Outlet />
    </PortalLayout>
  );
}