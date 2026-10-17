import { authErrorMessages, type AuthErrorCode } from "./types.ts";

export interface LaravelErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export function statusToCode(status: number, body: LaravelErrorBody): AuthErrorCode {
  if (body.code && Object.prototype.hasOwnProperty.call(authErrorMessages, body.code)) {
    return body.code as AuthErrorCode;
  }

  if (status === 422) return "validation-error";
  if (status === 401) return "invalid-credentials";
  // Approval and access policies also use 403. Only an explicit backend code
  // can send someone into the email-verification flow.
  if (status === 403) return "access-denied";
  if (status === 423 || status === 429) return "account-locked";
  return "server-error";
}
