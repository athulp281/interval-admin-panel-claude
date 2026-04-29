import { authApiMock, registerMockSessionListener } from "./authApi";
import { authApiReal } from "./authApi.real";
import { registerSessionListener } from "@/lib/axios";
import type { SessionEnvelope } from "./types";
import type { AuthApi } from "./authApi.contract";

/**
 * Mock vs real selector:
 * - Explicit `VITE_USE_MOCK_API=true|false` always wins.
 * - Otherwise: real backend if `VITE_API_BASE_URL` is set, mock if not.
 *   This lets the app boot against the mock with zero env config, and switch
 *   to the real backend just by setting `VITE_API_BASE_URL` in `.env.local`.
 */
const explicit = import.meta.env.VITE_USE_MOCK_API;
const useMock =
  explicit === "true"
    ? true
    : explicit === "false"
      ? false
      : !import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    `%c[auth] using ${useMock ? "MOCK" : "REAL"} API` +
      (useMock ? "" : ` → ${import.meta.env.VITE_API_BASE_URL}`),
    "color:#6f3f97;font-weight:bold"
  );
}

export const authApi: AuthApi = useMock ? authApiMock : authApiReal;

/**
 * Wires session-envelope events from whichever transport is active into the
 * auth store. Called once during store creation.
 */
export function bindSessionListener(fn: (env: SessionEnvelope<unknown>) => void) {
  if (useMock) registerMockSessionListener(fn);
  else registerSessionListener(fn);
}

export type { AuthApi } from "./authApi.contract";
