import { createFileRoute } from "@tanstack/react-router";
import { TeacherLessonResources } from "@/components/teacher/TeacherLessonResources";

export const Route = createFileRoute("/teacher/worksheets")({
  component: WorksheetsPage,
});

function WorksheetsPage() {
  return (
    <TeacherLessonResources
      title="Worksheets"
      description="Manage worksheets attached to your lessons."
      singularLabel="Worksheet"
      contentType="worksheet"
      contentLabel="Worksheet instructions or content"
      contentPlaceholder="Enter worksheet instructions, questions or supporting text..."
      urlPlaceholder="https://... worksheet or PDF URL"
    />
  );
}