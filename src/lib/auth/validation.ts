/** Frontend-only validation helpers for the authentication module. */

import type { FieldErrors } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required.`;
  return undefined;
}

export function validateMobile(value: string): string | undefined {
  if (!value.trim()) return "Mobile number is required.";
  if (!MOBILE_RE.test(value.replace(/\s+/g, ""))) return "Enter a valid 10-digit mobile number.";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

export function validateMatch(a: string, b: string): string | undefined {
  if (!b) return "Please confirm your password.";
  if (a !== b) return "Passwords do not match.";
  return undefined;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  /** Tailwind class for the meter fill, driven by semantic tokens. */
  toneClass: string;
  hints: { label: string; met: boolean }[];
}

export function getPasswordStrength(value: string): PasswordStrength {
  const hints = [
    { label: "At least 8 characters", met: value.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(value) },
    { label: "One number", met: /\d/.test(value) },
    { label: "One symbol", met: /[^A-Za-z0-9]/.test(value) },
  ];
  const score = hints.filter((hint) => hint.met).length as 0 | 1 | 2 | 3 | 4;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;
  const tones = [
    "bg-destructive",
    "bg-destructive",
    "bg-warning",
    "bg-primary",
    "bg-primary",
  ] as const;
  return { score, label: labels[score], toneClass: tones[score], hints };
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Merges server-side (Laravel 422) errors into locally computed ones. */
export function mergeFieldErrors(local: FieldErrors, server?: FieldErrors): FieldErrors {
  return { ...local, ...(server ?? {}) };
}

