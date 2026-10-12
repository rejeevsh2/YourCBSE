/**
 * Laravel-backed implementation of AuthService.
 *
 * Request bodies use snake_case to match Laravel.
 * Responses are converted to the frontend AuthSession format.
 */

import { apiRequest, authEndpoints } from "./http";
import { clearSession, saveSession } from "./session";
import type { AuthService, AuthSession } from "./types";

interface ApiUser {
  id: string | number;
  full_name?: string;
  name?: string;
  email: string;
  mobile?: string;
  role?: AuthSession["user"]["role"];
  email_verified_at?: string | null;
  avatar_url?: string;
}

interface ApiSession {
  token: string;
  expires_at?: string;
  user: ApiUser;
}

function toSession(payload: ApiSession): AuthSession {
  return {
    token: payload.token,

    expiresAt: payload.expires_at
      ? Date.parse(payload.expires_at)
      : undefined,

    user: {
      id: String(payload.user.id),

      fullName:
        payload.user.full_name ??
        payload.user.name ??
        "",

      email: payload.user.email,

      mobile: payload.user.mobile,

      role: payload.user.role ?? "student",

      emailVerified: Boolean(
        payload.user.email_verified_at
      ),

      avatarUrl: payload.user.avatar_url,
    },
  };
}

export const laravelAuthService: AuthService = {
  async login({ email, password, remember }) {
    const result = await apiRequest<ApiSession>(
      authEndpoints.login,
      {
        body: {
          email,
          password,
          remember,
        },
      }
    );

    if (!result.ok) {
      return result;
    }

    if (!result.data) {
      return {
        ok: false,
        code: "server-error",
        message: "Login response did not contain session data.",
      };
    }

    const session = toSession(result.data);

    saveSession(session, remember);

    return {
      ...result,
      data: session,
    };
  },

  async register(payload) {
    const result = await apiRequest<{ email: string }>(
      authEndpoints.register,
      {
        body: {
          name: payload.fullName,
          email: payload.email,
          mobile: payload.mobile,
          password: payload.password,
          password_confirmation:
            payload.passwordConfirmation,
          role: payload.role,
        },
      }
    );

    return result.ok
      ? {
          ...result,
          data: {
            email: payload.email,
          },
        }
      : result;
  },

  forgotPassword(email) {
    return apiRequest(
      authEndpoints.forgotPassword,
      {
        body: { email },
      }
    );
  },

  resetPassword(payload) {
    return apiRequest(
      authEndpoints.resetPassword,
      {
        body: {
          email: payload.email,
          token: payload.token,
          password: payload.password,
          password_confirmation:
            payload.passwordConfirmation,
        },
      }
    );
  },

  async verifyOtp({ email, code }) {
    const result =
      await apiRequest<ApiSession | undefined>(
        authEndpoints.verifyOtp,
        {
          body: {
            email,
            code,
          },
        }
      );

    if (!result.ok) {
      return result;
    }

    const session =
      result.data?.token
        ? toSession(result.data)
        : undefined;

    if (session) {
      saveSession(session);
    }

    return {
      ...result,
      data: session,
    };
  },

  resendOtp(email) {
    return apiRequest(
      authEndpoints.resendOtp,
      {
        body: { email },
      }
    );
  },

  resendVerificationEmail(email) {
    return apiRequest(
      authEndpoints.resendVerification,
      {
        body: { email },
      }
    );
  },

  async signInWithGoogle() {
    const result = await apiRequest<{
      url: string;
    }>(
      authEndpoints.googleRedirect,
      {
        method: "GET",
      }
    );

    if (
      result.ok &&
      result.data?.url &&
      typeof window !== "undefined"
    ) {
      window.location.assign(
        result.data.url
      );
    }

    return result.ok
      ? {
          ...result,
          data: undefined,
        }
      : result;
  },

  async logout() {
    const result = await apiRequest(
      authEndpoints.logout
    );

    clearSession();

    return result;
  },
};