import { createFileRoute } from "@tanstack/react-router";
import { TeacherLessonResources } from "@/components/teacher/TeacherLessonResources";

export const Route = createFileRoute("/teacher/videos")({
  component: VideosPage,
});

function VideosPage() {
  return (
    <TeacherLessonResources
      title="Videos"
      description="Manage video resources attached to your lessons."
      singularLabel="Video"
      contentType="video"
      contentLabel="Video notes or embed details"
      contentPlaceholder="Optional notes, transcript or embed details..."
      urlPlaceholder="https://youtube.com/... or https://..."
    />
  );
}