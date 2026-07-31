/**
 * Browser-side session storage for the auth token.
 *
 * The Laravel API (Sanctum personal access tokens) returns a bearer token that
 * every authenticated request must send. Keeping the read/write here means the
 * HTTP client and any future `useAuth()` hook share one source of truth.
 */

import type { AuthSession } from "./types";

const TOKEN_KEY = "yourcbse.auth.token";
const USER_KEY = "yourcbse.auth.user";

function storage(remember: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return remember ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Reads the token from either store (persistent first). */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthSession["user"] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY) ?? window.sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthSession["user"]) : null;
  } catch {
    return null;
  }
}

/** Persists a session. `remember` picks localStorage over sessionStorage. */
export function saveSession(session: AuthSession, remember = true) {
  const store = storage(remember);
  if (!store) return;
  try {
    clearSession();
    store.setItem(TOKEN_KEY, session.token);
    store.setItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    /* storage unavailable — session stays in memory only */
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      store.removeItem(TOKEN_KEY);
      store.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  }
}
