import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthToken, getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    /*
     * Authentication is stored in browser localStorage/sessionStorage.
     *
     * During SSR there is no window object, so we must not perform
     * browser-storage authentication checks on the server.
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

    // Logged in, but not an admin
    if (user.role !== "admin") {
      if (user.role === "teacher") {
        throw redirect({
          to: "/teacher",
        });
      }

      if (user.role === "student") {
        throw redirect({
          to: "/student",
        });
      }

      throw redirect({
        to: "/login",
      });
    }
  },

  head: () => ({
    meta: [
      { title: "Admin Portal — YourTeacher" },
      {
        name: "description",
        content: "Manage users, content, analytics and website settings.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),

  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  return (
    <PortalLayout portal="admin">
      <Outlet />
    </PortalLayout>
  );
}