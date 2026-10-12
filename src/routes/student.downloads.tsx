import { createFileRoute } from "@tanstack/react-router";

import { LiveLibrary } from "@/components/resource-center/LiveLibrary";

export const Route = createFileRoute("/student/downloads")({
  component: StudentDownloadsPage,
});

function StudentDownloadsPage() {
  return (
    <LiveLibrary
      portal="student"
      mode="downloads"
    />
  );
}