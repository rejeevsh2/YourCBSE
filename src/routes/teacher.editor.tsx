import { createFileRoute } from "@tanstack/react-router";
import { TeacherWorkspace } from "@/components/teacher/TeacherWorkspace";
export const Route = createFileRoute("/teacher/editor")({ component: () => <TeacherWorkspace /> });
