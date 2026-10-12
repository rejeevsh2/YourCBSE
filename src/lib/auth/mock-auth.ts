/**
 * Placeholder auth implementation used until the Laravel API is live.
 *
 * It fulfils the same `AuthService` contract as the HTTP client, so screens
 * behave identically once the real backend is switched on.
 */

import {
  authFailure,
  authSuccess,
  type AuthErrorCode,
  type AuthResult,
  type AuthService,
  type AuthSession,
} from "./types";

function delay(ms = 900) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** Demo accounts that trigger specific error states in the UI. */
const demoTriggers: Record<string, AuthErrorCode> = {
  "unknown@yourschool.co.in": "wrong-email",
  "wrongpass@yourschool.co.in": "wrong-password",
  "unverified@yourschool.co.in": "email-not-verified",
  "locked@yourschool.co.in": "account-locked",
  "offline@yourschool.co.in": "network-error",
  "taken@yourschool.co.in": "email-taken",
};

function demoSession(email: string, fullName = "Aarav Sharma"): AuthSession {
  return {
    token: "demo-token",
    expiresAt: Date.now() + 1000 * 60 * 60,
    user: {
      id: "usr_demo",
      fullName,
      email,
      role: "student",
      emailVerified: true,
    },
  };
}

export const mockAuthService: AuthService = {
  async login({ email }) {
    await delay();
    const trigger = demoTriggers[email.trim().toLowerCase()];
    if (trigger) return authFailure(trigger);
    return authSuccess("Signed in successfully.", demoSession(email));
  },

  async register({ email, fullName }) {
    await delay(1100);
    const trigger = demoTriggers[email.trim().toLowerCase()];
    if (trigger === "email-taken") {
      return authFailure("email-taken", undefined, { email: "This email is already registered." });
    }
    void fullName;
    return authSuccess("Account created.", { email });
  },

  async forgotPassword(email) {
    await delay();
    if (demoTriggers[email.trim().toLowerCase()] === "network-error") {
      return authFailure("network-error");
    }
    return authSuccess("Reset link sent.");
  },

  async resetPassword({ password }) {
    await delay();
    if (!password) return authFailure("validation-error");
    return authSuccess("Password updated.");
  },

  async verifyOtp({ code, email }): Promise<AuthResult<AuthSession | undefined>> {
    await delay(800);
    if (code === "000000") return authFailure("otp-expired");
    if (code !== "123456") return authFailure("invalid-otp");
    return authSuccess("Code verified.", email ? demoSession(email) : undefined);
  },

  async resendOtp() {
    await delay(700);
    return authSuccess("A new code is on its way.");
  },

  async resendVerificationEmail() {
    await delay(700);
    return authSuccess("Verification email sent.");
  },

  async signInWithGoogle() {
    await delay(900);
    return authSuccess("Google sign-in will be connected in a later phase.", undefined);
  },

  async logout() {
    await delay(300);
    return authSuccess("Signed out.");
  },
};

