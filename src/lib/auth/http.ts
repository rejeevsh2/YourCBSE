/**
 * HTTP client for the Laravel API.
 */

import { getAuthToken } from "./session";
import {
  authFailure,
  type AuthErrorCode,
  type AuthResult,
  type FieldErrors,
} from "./types";

export const API_BASE_URL =
  ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api").replace(/\/+$/, "");

export const authEndpoints = {
  login: "/login",
  register: "/register",
  logout: "/logout",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyOtp: "/verify-otp",
  resendOtp: "/resend-otp",
  resendVerification: "/email/resend",
  googleRedirect: "/google/redirect",
  me: "/me",
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

export function toFieldErrors(
  errors?: Record<string, string[]>,
): FieldErrors | undefined {
  if (!errors) return undefined;

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      toCamelCase(field),
      messages[0],
    ]),
  );
}

function toCamelCase(value: string) {
  return value.replace(
    /_([a-z])/g,
    (_, char: string) => char.toUpperCase(),
  );
}

function statusToCode(
  status: number,
  body: LaravelErrorBody,
): AuthErrorCode {
  if (body.code && isAuthErrorCode(body.code)) {
    return body.code;
  }

  if (status === 422) return "validation-error";
  if (status === 401) return "invalid-credentials";
  if (status === 403) return "email-not-verified";
  if (status === 423 || status === 429) return "account-locked";

  return "server-error";
}

function isAuthErrorCode(
  value: string,
): value is AuthErrorCode {
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
    "account-pending-approval",
    "account-rejected",
    "account-paused",
  ].includes(value);
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(
    init.headers,
  );

  if (!headers.has("Accept")) {
    headers.set(
      "Accept",
      "application/json",
    );
  }

  if (
    !headers.has(
      "X-Requested-With",
    )
  ) {
    headers.set(
      "X-Requested-With",
      "XMLHttpRequest",
    );
  }

  if (
    token &&
    !headers.has("Authorization")
  ) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  return fetch(input, {
    ...init,
    credentials:
      init.credentials ?? "include",
    headers,
  });
}
export async function apiRequest<TData = undefined>(
  path: string,
  {
    method = "POST",
    body,
    signal,
  }: RequestOptions = {},
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
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });

    /*
     * Laravel currently has BOM characters before some JSON responses.
     * Read as text and remove all leading BOM/zero-width characters
     * before parsing.
     */
    const rawText = await response.text();

    const cleanText = rawText
      .replace(/^[\uFEFF\u200B]+/, "")
      .trim();

    let payload: any = {};

    if (cleanText !== "") {
      try {
        payload = JSON.parse(cleanText);
      } catch (error) {
        console.error("JSON parse failed:", error);


        return authFailure("server-error");
      }
    }

    if (!response.ok) {
      return authFailure(
        statusToCode(
          response.status,
          payload as LaravelErrorBody,
        ),
        payload?.message,
        toFieldErrors(payload?.errors),
      );
    }

    /*
     * Support both Laravel response formats:
     *
     * Direct:
     * {
     *   message: "...",
     *   token: "...",
     *   user: {...}
     * }
     *
     * Wrapped:
     * {
     *   message: "...",
     *   data: {...}
     * }
     */
    const responseData =
      payload &&
      typeof payload === "object" &&
      Object.prototype.hasOwnProperty.call(payload, "data")
        ? payload.data
        : payload;

    return {
      ok: true,
      message: payload?.message ?? "Success",
      data: responseData as TData,
    };
  } catch (error) {
    console.error("API request failed:", error);

    return authFailure("network-error");
  }
}