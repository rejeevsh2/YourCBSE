import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LibraryShell } from "@/components/resource-center/LibraryShell";

export const Route = createFileRoute("/library")({
  component: LibraryLayout,
});

function LibraryLayout() {
  return (
    <LibraryShell>
      <Outlet />
    </LibraryShell>
  );
}
