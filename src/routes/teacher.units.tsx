import { createFileRoute } from "@tanstack/react-router";

import { TeacherCurriculumBrowser } from "@/components/teacher/TeacherCurriculumBrowser";

export const Route = createFileRoute("/teacher/units")({
  component: TeacherUnitsPage,
});

function TeacherUnitsPage() {
  return (
    <TeacherCurriculumBrowser
      mode="units"
    />
  );
}