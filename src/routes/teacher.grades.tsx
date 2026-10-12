import { createFileRoute } from "@tanstack/react-router";
import { TeacherCurriculumBrowser } from "@/components/teacher/TeacherCurriculumBrowser";

export const Route = createFileRoute("/teacher/grades")({
  component: TeacherGradesPage,
});

function TeacherGradesPage() {
  return (
    <TeacherCurriculumBrowser mode="grades" />
  );
}