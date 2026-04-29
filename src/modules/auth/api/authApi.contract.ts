import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TwoFactorResendRequest,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  User,
} from "./types";

/**
 * Stores call methods on this interface — the mock and the real axios-backed
 * implementations both satisfy it. Returns *unwrapped* data; the session side
 * of every envelope is handled by the axios interceptor (real) or the auth
 * store directly (mock), not by callers.
 */
export interface AuthApi {
  login(req: LoginRequest): Promise<LoginResponse>;
  verifyTwoFactor(req: TwoFactorVerifyRequest): Promise<TwoFactorVerifyResponse>;
  resendTwoFactor(req: TwoFactorResendRequest): Promise<{ ok: true }>;
  register(req: RegisterRequest): Promise<RegisterResponse>;
  forgotPassword(req: ForgotPasswordRequest): Promise<{ ok: true }>;
  me(): Promise<{ user: User | null }>;
  logout(): Promise<{ ok: true }>;
}
