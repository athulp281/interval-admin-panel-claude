import { axiosClient } from "./axios";
import type { SessionEnvelope } from "@/modules/auth/api/types";

type Method = "get" | "post" | "put" | "patch" | "delete";

/**
 * Single entry point for any backend call. The axios response interceptor
 * handles the session side of the envelope; this helper unwraps `data` so
 * stores don't repeat the boilerplate.
 *
 * Throws `ApiError` (already normalized by the axios error interceptor) on
 * failure, so stores can `try/catch` typed errors.
 */
export async function apiCall<T>(
  method: Method,
  url: string,
  body?: unknown,
  config?: Parameters<typeof axiosClient.request>[0]
): Promise<T> {
  const res = await axiosClient.request<SessionEnvelope<T>>({
    method,
    url,
    data: body,
    ...config,
  });
  return res.data.data;
}

export const api = {
  get: <T>(url: string, config?: Parameters<typeof axiosClient.request>[0]) =>
    apiCall<T>("get", url, undefined, config),
  post: <T>(url: string, body?: unknown, config?: Parameters<typeof axiosClient.request>[0]) =>
    apiCall<T>("post", url, body, config),
  put: <T>(url: string, body?: unknown, config?: Parameters<typeof axiosClient.request>[0]) =>
    apiCall<T>("put", url, body, config),
  patch: <T>(url: string, body?: unknown, config?: Parameters<typeof axiosClient.request>[0]) =>
    apiCall<T>("patch", url, body, config),
  delete: <T>(url: string, config?: Parameters<typeof axiosClient.request>[0]) =>
    apiCall<T>("delete", url, undefined, config),
};
