/**
 * Shared authentication contracts.
 *
 * These types are the boundary between the UI and whichever auth
 * implementation is active (mock today, Laravel API later), so routes never
 * depend on transport details.
 */

export type UserRole = "student" | "teacher" | "parent" | "admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: UserRole;
  emailVerified: boolean;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  /** Unix ms expiry, when the API reports one. */
  expiresAt?: number;
  user: AuthUser;
}

export type AuthErrorCode =
  | "wrong-email"
  | "wrong-password"
  | "invalid-credentials"
  | "email-taken"
  | "invalid-otp"
  | "otp-expired"
  | "validation-error"
  | "network-error"
  | "server-error"
  | "access-denied"
  | "email-not-verified"
  | "account-locked"
  | "account-pending-approval"
  | "account-rejected";

/** Field-level messages keyed by form field name (Laravel `errors` shape). */
export type FieldErrors = Record<string, string | undefined>;

export interface AuthSuccess<TData = undefined> {
  ok: true;
  message: string;
  data?: TData;
}

export interface AuthFailure {
  ok: false;
  code: AuthErrorCode;
  message: string;
  /** Populated for 422 validation responses. */
  fieldErrors?: FieldErrors;
}

export type AuthResult<TData = undefined> = AuthSuccess<TData> | AuthFailure;

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  passwordConfirmation: string;
  role: Extract<UserRole, "student" | "teacher">;
  gradeIds?: number[];
}

export interface ResetPasswordPayload {
  email?: string;
  token?: string;
  password: string;
  passwordConfirmation: string;
}

export interface VerifyOtpPayload {
  email?: string;
  code: string;
}

/**
 * Every auth screen talks to this interface only. Swapping the mock for the
 * Laravel client is a one-line change in `auth-service.ts`.
 */
export interface AuthService {
  login(payload: LoginPayload): Promise<AuthResult<AuthSession>>;
  register(payload: RegisterPayload): Promise<AuthResult<{ email: string }>>;
  forgotPassword(email: string): Promise<AuthResult>;
  resetPassword(payload: ResetPasswordPayload): Promise<AuthResult>;
  verifyOtp(payload: VerifyOtpPayload): Promise<AuthResult<AuthSession | undefined>>;
  resendOtp(email?: string): Promise<AuthResult>;
  resendVerificationEmail(email?: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult<AuthSession | undefined>>;
  logout(): Promise<AuthResult>;
}

export const authErrorMessages: Record<AuthErrorCode, string> = {
  "wrong-email": "We couldn't find an account with that email address.",
  "wrong-password": "That password is incorrect. Please try again.",
  "invalid-credentials": "Those credentials don't match our records.",
  "email-taken": "This email is already registered.",
  "invalid-otp": "That code isn't valid. Check the digits and try again.",
  "otp-expired": "This code has expired. Request a new one to continue.",
  "validation-error": "Please check the highlighted fields and try again.",
  "network-error": "Network error — check your connection and try again.",
  "server-error": "Our servers hit a snag. Please try again in a moment.",
  "access-denied": "Your account cannot access this service. Please contact your school administrator.",
  "email-not-verified": "Please verify your email address before signing in.",
  "account-locked": "Your account has been temporarily locked for security.",
  "account-pending-approval": "Your account is waiting for administrator approval.",
  "account-rejected": "This account was not approved. Please contact the YourSchool administrator.",
};

export function authSuccess<TData>(message: string, data?: TData): AuthSuccess<TData> {
  return { ok: true, message, data };
}

export function authFailure(
  code: AuthErrorCode,
  message?: string,
  fieldErrors?: FieldErrors,
): AuthFailure {
  return { ok: false, code, message: message ?? authErrorMessages[code], fieldErrors };
}

