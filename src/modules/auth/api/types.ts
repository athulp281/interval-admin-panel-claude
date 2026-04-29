/**
 * Shared request/response types for the auth module.
 * Keep this file in lockstep with `docs/auth-api.md`.
 */

export type SessionStatus = "active" | "expired" | "anonymous";

/**
 * Every authenticated API response should include this envelope so the
 * client can react to server-side session state without a separate poll.
 * Public endpoints (login, register, etc.) MAY include it for symmetry.
 */
export interface SessionEnvelope<T> {
  data: T;
  session: {
    status: SessionStatus;
    expiresAt: string | null;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export type LoginResponse =
  | { kind: "twoFactorRequired"; challengeId: string }
  | { kind: "loggedIn"; user: User };

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

export interface RegisterResponse {
  user: User;
}

export interface TwoFactorVerifyRequest {
  challengeId: string;
  code: string;
}

export interface TwoFactorVerifyResponse {
  user: User;
}

export interface TwoFactorResendRequest {
  challengeId: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
