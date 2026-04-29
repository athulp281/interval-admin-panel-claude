import type { ApiError } from "../api/types";

/**
 * Maps backend error codes (per `AUTH-API.md § 4`) to user-facing messages.
 * Falls back to `err.message` when the code is unknown — the backend already
 * returns safe-to-render messages, so this is mostly UX polish.
 */
const FRIENDLY: Record<string, string> = {
  invalid_credentials: "Email or password is incorrect.",
  invalid_email: "Please enter a valid email address.",
  weak_password: "Your password doesn't meet the strength requirements.",
  terms_not_accepted: "You must accept the Terms of Service to continue.",
  invalid_code: "That code isn't right. Please try again.",
  challenge_expired:
    "Your verification window has expired. Please sign in again.",
  email_taken: "An account with this email already exists.",
  account_inactive:
    "Your account has been deactivated. Contact your administrator.",
  too_many_attempts:
    "Too many failed attempts. Please wait 15 minutes before trying again.",
  too_many_resends:
    "You've requested a new code too many times. Please sign in again.",
  tenant_unknown: "Unknown organization. Please contact support.",
  unauthenticated: "Your session has ended. Please sign in again.",
  network_error: "Network error. Please check your connection.",
};

export function authErrorMessage(err: ApiError | unknown, fallback = "Something went wrong"): string {
  const e = err as ApiError | undefined;
  if (!e || typeof e !== "object") return fallback;
  if (e.code && FRIENDLY[e.code]) return FRIENDLY[e.code];
  return e.message ?? fallback;
}
