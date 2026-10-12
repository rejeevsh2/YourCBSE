import { createFileRoute } from "@tanstack/react-router";
import { TeacherLessonResources } from "@/components/teacher/TeacherLessonResources";

export const Route = createFileRoute("/teacher/mind-maps")({
  component: MindMapsPage,
});

function MindMapsPage() {
  return (
    <TeacherLessonResources
      title="Mind Maps"
      description="Manage visual mind-map resources for your lessons."
      singularLabel="Mind Map"
      contentType="image"
      contentLabel="Description or supporting content"
      contentPlaceholder="Describe the mind map or add supporting text..."
      urlPlaceholder="https://... image or mind-map URL"
    />
  );
}