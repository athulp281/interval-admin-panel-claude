import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { authApi, bindSessionListener } from "@/modules/auth/api";
import type {
  ApiError,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SessionStatus,
  User,
} from "@/modules/auth/api/types";

type Status = SessionStatus | "loading";

interface AuthState {
  user: User | null;
  status: Status;
  /** Last login email — persisted for the "remember email" UX nicety. */
  lastEmail: string | null;
  bootstrapped: boolean;
}

interface AuthActions {
  bootstrap: () => Promise<void>;
  login: (req: LoginRequest) => Promise<LoginResponse>;
  verifyTwoFactor: (challengeId: string, code: string) => Promise<User>;
  resendTwoFactor: (challengeId: string) => Promise<void>;
  register: typeof authApi.register;
  logout: () => Promise<void>;
  /** Internal — wired to axios/mock interceptors. Not for component use. */
  _onSessionEnvelope: (status: SessionStatus) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => {
        bindSessionListener((env) => {
          get()._onSessionEnvelope(env.session.status);
        });

        return {
          user: null,
          status: "loading",
          lastEmail: null,
          bootstrapped: false,

          bootstrap: async () => {
            try {
              const { user } = await authApi.me();
              set((s) => {
                s.user = user;
                s.bootstrapped = true;
              });
            } catch {
              set((s) => {
                s.user = null;
                s.status = "anonymous";
                s.bootstrapped = true;
              });
            }
          },

          login: async (req) => {
            const res = await authApi.login(req);
            set((s) => {
              s.lastEmail = req.email;
            });
            return res;
          },

          verifyTwoFactor: async (challengeId, code) => {
            const { user } = await authApi.verifyTwoFactor({ challengeId, code });
            set((s) => {
              s.user = user;
            });
            return user;
          },

          resendTwoFactor: async (challengeId) => {
            await authApi.resendTwoFactor({ challengeId });
          },

          register: async (req: RegisterRequest) => {
            return authApi.register(req);
          },

          logout: async () => {
            try {
              await authApi.logout();
            } finally {
              set((s) => {
                s.user = null;
                s.status = "anonymous";
              });
            }
          },

          _onSessionEnvelope: (status) => {
            set((s) => {
              s.status = status;
              if (status !== "active") s.user = null;
            });
          },
        };
      }),
      {
        name: "interval-auth-prefs",
        // Persist ONLY non-sensitive UX fields — never user/session.
        // Cookie is the source of truth for session.
        partialize: (s) => ({ lastEmail: s.lastEmail }),
      }
    ),
    { name: "AuthStore" }
  )
);

/** Narrow selector hooks — components subscribe only to what they use. */
export const useAuthUser = () => useAuthStore((s) => s.user);
export const useAuthStatus = () => useAuthStore((s) => s.status);
export const useIsAuthenticated = () =>
  useAuthStore((s) => s.status === "active" && s.user !== null);
export const useLastEmail = () => useAuthStore((s) => s.lastEmail);

/** Typed error helper for try/catch blocks in components. */
export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" && err !== null && "code" in err && "message" in err
  );
}
