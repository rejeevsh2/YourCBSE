import { createFileRoute } from "@tanstack/react-router";
import { TeacherCurriculumBrowser } from "@/components/teacher/TeacherCurriculumBrowser";

export const Route = createFileRoute("/teacher/subjects")({
  component: TeacherSubjectsPage,
});

function TeacherSubjectsPage() {
  return (
    <TeacherCurriculumBrowser mode="subjects" />
  );
}