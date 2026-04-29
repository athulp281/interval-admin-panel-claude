import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores/authStore";

export default function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const isAuthenticated = useAuthStore(
    (s) => s.status === "active" && s.user !== null
  );
  const location = useLocation();

  if (!bootstrapped || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500/40 border-t-brand-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
