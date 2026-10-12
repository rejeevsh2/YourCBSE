/**
 * Single entry point for student data.
 *
 * Screens import `studentService` and never touch the transport. Set
 * `VITE_USE_MOCK_DATA=false` once the Laravel API is ready — no component
 * changes required.
 */

import { laravelStudentService } from "./laravel-student";
import { mockStudentService } from "./mock-student";
import type { StudentService } from "./types";

const useMock = (import.meta.env.VITE_USE_MOCK_DATA as string | undefined) === "true";

export const studentService: StudentService = useMock ? mockStudentService : laravelStudentService;

export const isMockStudentData = useMock;

export { studentEndpoints } from "./endpoints";
export * from "./types";

