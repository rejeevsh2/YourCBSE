/**
 * Single entry point for authentication.
 *
 * Screens import `authService` and never touch the transport. Flip
 * `VITE_USE_MOCK_AUTH=false` (or simply set `VITE_API_BASE_URL`) once the
 * Laravel API is ready — no component changes required.
 */

import { laravelAuthService } from "./laravel-auth";
import { mockAuthService } from "./mock-auth";
import type { AuthService } from "./types";

const useMock = (import.meta.env.VITE_USE_MOCK_AUTH as string | undefined) !== "false";

export const authService: AuthService = useMock ? mockAuthService : laravelAuthService;

export const isMockAuth = useMock;
