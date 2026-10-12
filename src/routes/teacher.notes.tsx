import { createFileRoute } from "@tanstack/react-router";
import { TeacherLessonResources } from "@/components/teacher/TeacherLessonResources";

export const Route = createFileRoute("/teacher/notes")({
  component: NotesPage,
});

function NotesPage() {
  return (
    <TeacherLessonResources
      title="Notes"
      description="Create and manage lesson notes."
      singularLabel="Note"
      contentType="text"
      contentLabel="Note content"
      contentPlaceholder="Write the lesson note..."
    />
  );
}