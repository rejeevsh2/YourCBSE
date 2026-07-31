/**
 * Thin HTTP client for the future Laravel API.
 *
 * Nothing here runs while the mock service is active — it exists so switching
 * to the real backend needs no changes in components. Configure the base URL
 * with `VITE_API_BASE_URL` (e.g. https://api.yourcbse.com/api).
 */

import { getAuthToken } from "./session";
import { authFailure, type AuthErrorCode, type AuthResult, type FieldErrors } from "./types";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

/** Laravel endpoints, kept in one place for easy renaming. */
export const authEndpoints = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyOtp: "/auth/verify-otp",
  resendOtp: "/auth/resend-otp",
  resendVerification: "/auth/email/resend",
  googleRedirect: "/auth/google/redirect",
  me: "/auth/me",
} as const;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

interface LaravelErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

/** Maps a Laravel `errors` bag to the flat shape the forms consume. */
export function toFieldErrors(errors?: Record<string, string[]>): FieldErrors | undefined {
  if (!errors) return undefined;
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [toCamelCase(field), messages[0]]),
  );
}

function toCamelCase(value: string) {
  return value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

function statusToCode(status: number, body: LaravelErrorBody): AuthErrorCode {
  if (body.code && isAuthErrorCode(body.code)) return body.code;
  if (status === 422) return "validation-error";
  if (status === 401) return "invalid-credentials";
  if (status === 403) return "email-not-verified";
  if (status === 423 || status === 429) return "account-locked";
  return "server-error";
}

function isAuthErrorCode(value: string): value is AuthErrorCode {
  return [
    "wrong-email",
    "wrong-password",
    "invalid-credentials",
    "email-taken",
    "invalid-otp",
    "otp-expired",
    "validation-error",
    "network-error",
    "server-error",
    "email-not-verified",
    "account-locked",
  ].includes(value);
}

/**
 * Performs a JSON request and normalises both success and failure into
 * `AuthResult`, so callers never deal with `fetch` rejections.
 */
export async function apiRequest<TData = undefined>(
  path: string,
  { method = "POST", body, signal }: RequestOptions = {},
): Promise<AuthResult<TData>> {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => ({}))) as LaravelErrorBody & {
      data?: TData;
    };

    if (!response.ok) {
      return authFailure(
        statusToCode(response.status, payload),
        payload.message,
        toFieldErrors(payload.errors),
      );
    }

    return {
      ok: true,
      message: payload.message ?? "Success",
      data: (payload.data ?? (payload as unknown as TData)) as TData,
    };
  } catch {
    return authFailure("network-error");
  }
}
