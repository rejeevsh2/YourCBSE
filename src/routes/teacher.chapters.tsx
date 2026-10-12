import { createFileRoute } from "@tanstack/react-router";
import { TeacherCurriculumBrowser } from "@/components/teacher/TeacherCurriculumBrowser";

export const Route = createFileRoute("/teacher/chapters")({
  component: TeacherChaptersPage,
});

function TeacherChaptersPage() {
  return (
    <TeacherCurriculumBrowser mode="chapters" />
  );
}