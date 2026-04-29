import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";

interface ProviderProps {
  children: ReactNode;
}

/**
 * Compatibility wrapper kept for the existing `<AuthProvider>` mount in
 * `main.tsx`. State now lives in `useAuthStore`; this component just kicks
 * off the one-shot bootstrap call to `/auth/me` after mount.
 */
export function AuthProvider({ children }: ProviderProps) {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  useEffect(() => {
    if (!bootstrapped) bootstrap();
  }, [bootstrap, bootstrapped]);

  return <>{children}</>;
}
