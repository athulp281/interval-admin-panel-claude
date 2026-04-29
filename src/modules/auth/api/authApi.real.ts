import { api } from "@/lib/apiCall";
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
import type { AuthApi } from "./authApi.contract";

export const authApiReal: AuthApi = {
  login: (req: LoginRequest) => api.post<LoginResponse>("/auth/login", req),
  verifyTwoFactor: (req: TwoFactorVerifyRequest) =>
    api.post<TwoFactorVerifyResponse>("/auth/2fa/verify", req),
  resendTwoFactor: (req: TwoFactorResendRequest) =>
    api.post<{ ok: true }>("/auth/2fa/resend", req),
  register: (req: RegisterRequest) => api.post<RegisterResponse>("/auth/register", req),
  forgotPassword: (req: ForgotPasswordRequest) =>
    api.post<{ ok: true }>("/auth/forgot-password", req),
  me: () => api.get<{ user: User | null }>("/auth/me"),
  logout: () => api.post<{ ok: true }>("/auth/logout"),
};
