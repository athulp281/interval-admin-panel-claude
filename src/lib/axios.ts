import axios, { AxiosError, type AxiosResponse } from "axios";
import type { ApiError, SessionEnvelope } from "@/modules/auth/api/types";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://172.16.3.199:3000";

if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[axios] VITE_API_BASE_URL not set; defaulting to http://172.16.3.199:3000. " +
      "Set it in `.env` and restart the dev server."
  );
}

export const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/**
 * Optional multi-tenant slug. Backend §1.4: register accepts an optional
 * `x-tenant-slug` header; when omitted the server uses `DEFAULT_TENANT_SLUG`
 * (currently `interval`). Set `VITE_TENANT_SLUG` in `.env.local` to override.
 */
const tenantSlug = import.meta.env.VITE_TENANT_SLUG;
if (tenantSlug) {
  axiosClient.defaults.headers.common["x-tenant-slug"] = tenantSlug;
}

/**
 * The auth store registers itself here on creation. We can't import the store
 * directly because that would create a circular dependency: store → axios →
 * store. Late-binding via this setter keeps the dep graph clean.
 */
let onSessionEnvelope: ((env: SessionEnvelope<unknown>) => void) | null = null;
export function registerSessionListener(fn: typeof onSessionEnvelope) {
  onSessionEnvelope = fn;
}

function isSessionEnvelope(x: unknown): x is SessionEnvelope<unknown> {
  return (
    typeof x === "object" &&
    x !== null &&
    "data" in x &&
    "session" in x &&
    typeof (x as { session: unknown }).session === "object"
  );
}

function maybeRedirectOnExpiry(env: SessionEnvelope<unknown>) {
  if (env.session.status !== "expired") return;
  // Don't redirect if we're already on an /auth/* page — avoids a loop when
  // the auth pages themselves probe `/auth/me` or fail with `expired`.
  if (window.location.pathname.startsWith("/auth")) return;
  window.location.assign("/auth/login");
}

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (isSessionEnvelope(response.data)) {
      onSessionEnvelope?.(response.data);
      maybeRedirectOnExpiry(response.data);
    }
    return response;
  },
  (error: AxiosError<ApiError | SessionEnvelope<unknown>>) => {
    const body = error.response?.data;
    if (body && isSessionEnvelope(body)) {
      onSessionEnvelope?.(body);
      maybeRedirectOnExpiry(body);
    }
    // 401 unauthenticated on a protected route — backend doesn't always wrap
    // these in the envelope, so handle the bare HTTP status as a fallback.
    if (
      error.response?.status === 401 &&
      !window.location.pathname.startsWith("/auth")
    ) {
      window.location.assign("/auth/login");
    }
    const apiError: ApiError =
      body && "code" in body
        ? (body as ApiError)
        : {
            code: error.code ?? "network_error",
            message: error.message ?? "Network error",
          };
    return Promise.reject(apiError);
  }
);
