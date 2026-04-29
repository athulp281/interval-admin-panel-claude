import { useAuthStore } from "@/stores/authStore";

/**
 * Compatibility shim — `useAuth()` reads from `useAuthStore` so existing
 * components don't need to change. New components should prefer the narrow
 * selector hooks (`useAuthUser`, `useAuthStatus`, ...) for fewer re-renders.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.status === "active" && s.user !== null);
  const login = useAuthStore((s) => s.login);
  const verifyTwoFactor = useAuthStore((s) => s.verifyTwoFactor);
  const resendTwoFactor = useAuthStore((s) => s.resendTwoFactor);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const refresh = useAuthStore((s) => s.bootstrap);

  return {
    user,
    status,
    isAuthenticated,
    login,
    verifyTwoFactor,
    resendTwoFactor,
    register,
    logout,
    refresh,
  };
}
