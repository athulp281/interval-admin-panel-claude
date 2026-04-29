import { mockDb, publicUser } from "./mockDb";
import type { AuthApi } from "./authApi.contract";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SessionEnvelope,
  SessionStatus,
  TwoFactorResendRequest,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  User,
} from "./types";

const SESSION_COOKIE = "interval_session";
const SESSION_TTL_MS = 30 * 60 * 1000;
const SESSION_REMEMBER_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MOCK_LATENCY_MS = 350;

const sessions = new Map<string, { userId: string; expiresAt: number }>();

let onSessionEnvelope: ((env: SessionEnvelope<unknown>) => void) | null = null;
export function registerMockSessionListener(fn: typeof onSessionEnvelope) {
  onSessionEnvelope = fn;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), MOCK_LATENCY_MS));
}

function fail(code: string, message: string, fieldErrors?: Record<string, string>): never {
  const err = { code, message, fieldErrors };
  throw err;
}

function setCookie(name: string, value: string, maxAgeMs: number) {
  const expires = new Date(Date.now() + maxAgeMs).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function publishSession<T>(data: T): T {
  const token = readCookie(SESSION_COOKIE);
  const session = token ? sessions.get(token) : undefined;
  let status: SessionStatus = "anonymous";
  let expiresAt: string | null = null;
  if (session) {
    if (session.expiresAt < Date.now()) {
      status = "expired";
      sessions.delete(token!);
      clearCookie(SESSION_COOKIE);
    } else {
      status = "active";
      expiresAt = new Date(session.expiresAt).toISOString();
    }
  }
  onSessionEnvelope?.({ data, session: { status, expiresAt } });
  return data;
}

function issueSession(userId: string, rememberMe: boolean): void {
  const token = "tok_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const ttl = rememberMe ? SESSION_REMEMBER_TTL_MS : SESSION_TTL_MS;
  sessions.set(token, { userId, expiresAt: Date.now() + ttl });
  setCookie(SESSION_COOKIE, token, ttl);
}

function emailRegex(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const authApiMock: AuthApi = {
  async login(req: LoginRequest): Promise<LoginResponse> {
    if (!emailRegex(req.email)) fail("invalid_email", "Invalid email address");
    const user = mockDb.findUserByEmail(req.email);
    if (!user || user.password !== req.password) {
      fail("invalid_credentials", "Email or password is incorrect");
    }

    const challengeId = "ch_" + Math.random().toString(36).slice(2);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    mockDb.putChallenge({
      challengeId,
      userId: user.id,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      rememberMe: req.rememberMe,
    });
    // eslint-disable-next-line no-console
    console.info(`[mock] 2FA code for ${user.email}: ${code}`);

    return delay(publishSession<LoginResponse>({ kind: "twoFactorRequired", challengeId }));
  },

  async verifyTwoFactor(req: TwoFactorVerifyRequest): Promise<TwoFactorVerifyResponse> {
    const challenge = mockDb.getChallenge(req.challengeId);
    if (!challenge) fail("challenge_expired", "Verification code expired. Sign in again.");
    if (challenge.code !== req.code) fail("invalid_code", "Incorrect verification code");

    const user = mockDb.findUserById(challenge.userId);
    if (!user) fail("user_missing", "User no longer exists");

    mockDb.consumeChallenge(req.challengeId);
    issueSession(user.id, challenge.rememberMe);

    return delay(publishSession({ user: publicUser(user) }));
  },

  async resendTwoFactor(req: TwoFactorResendRequest): Promise<{ ok: true }> {
    const existing = mockDb.getChallenge(req.challengeId);
    if (!existing) fail("challenge_expired", "Verification expired. Sign in again.");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    mockDb.putChallenge({ ...existing, code, expiresAt: Date.now() + 5 * 60 * 1000 });
    // eslint-disable-next-line no-console
    console.info(`[mock] resent 2FA code: ${code}`);
    return delay(publishSession({ ok: true as const }));
  },

  async register(req: RegisterRequest): Promise<RegisterResponse> {
    if (!emailRegex(req.email)) fail("invalid_email", "Invalid email address");
    if (mockDb.findUserByEmail(req.email)) {
      fail("email_taken", "An account with this email already exists", {
        email: "Email is already registered",
      });
    }
    const user = mockDb.insertUser({
      id: "u_" + Math.random().toString(36).slice(2),
      name: req.name,
      email: req.email,
      password: req.password,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });
    return delay(publishSession({ user: publicUser(user) }));
  },

  async forgotPassword(_req: ForgotPasswordRequest): Promise<{ ok: true }> {
    return delay(publishSession({ ok: true as const }));
  },

  async me(): Promise<{ user: User | null }> {
    const token = readCookie(SESSION_COOKIE);
    const session = token ? sessions.get(token) : undefined;
    if (!token || !session) return delay(publishSession({ user: null }));
    if (session.expiresAt < Date.now()) {
      sessions.delete(token);
      clearCookie(SESSION_COOKIE);
      return delay(publishSession({ user: null }));
    }
    const user = mockDb.findUserById(session.userId);
    return delay(publishSession({ user: user ? publicUser(user) : null }));
  },

  async logout(): Promise<{ ok: true }> {
    const token = readCookie(SESSION_COOKIE);
    if (token) sessions.delete(token);
    clearCookie(SESSION_COOKIE);
    return delay(publishSession({ ok: true as const }));
  },
};
