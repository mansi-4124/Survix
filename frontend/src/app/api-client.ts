import { OpenAPI } from "@/api";
import axios from "axios";
import { AuthenticationService } from "@/api/services/AuthenticationService";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { unwrapApiResponse } from "@/lib/api-response";

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as
      | (typeof error.config & { __retried?: boolean })
      | undefined;
    const status = error?.response?.status as number | undefined;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest.__retried ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshBlocked()) {
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshed = unwrapApiResponse<any>(
            await AuthenticationService.authControllerRefresh(),
          );
          useAuthStore
            .getState()
            .setAuth(refreshed.user, refreshed.tokens?.accessToken);
          return true;
        } catch (refreshError) {
          const status = (refreshError as any)?.response?.status as
            | number
            | undefined;
          if (status === 401 || status === 403) {
            useAuthStore.getState().clearAuth();
          }
          if (status === 429 || status === 500 || status === 503) {
            if (status === 429) {
              const retryAfter = (refreshError as any)?.response?.headers?.[
                "retry-after"
              ] as string | undefined;
              blockRefreshUntil(retryAfter);
            }
            return false;
          }
          return false;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const didRefresh = await refreshPromise;
    if (!didRefresh) {
      throw error;
    }

    originalRequest.__retried = true;
    const token = useAuthStore.getState().accessToken;
    if (token) {
      originalRequest.headers = {
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
    }
    return axios.request(originalRequest);
  },
);

export const configureApiClient = () => {
  const env = import.meta.env.VITE_API_BASE_URL;
  OpenAPI.BASE =
    typeof env === "string"
      ? env
      : import.meta.env.DEV
        ? "http://localhost:3000"
        : window.location.origin;
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = "include";
  axios.defaults.timeout = 8000;
};

configureApiClient();

let refreshPromise: Promise<boolean> | null = null;
let refreshBlockedUntil: number | null = null;

const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/verify-email") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
};

const isRefreshBlocked = (): boolean => {
  if (refreshBlockedUntil == null) return false;
  if (Date.now() >= refreshBlockedUntil) {
    refreshBlockedUntil = null;
    return false;
  }
  return true;
};

const blockRefreshUntil = (retryAfter?: string) => {
  let blockMs = 30_000;
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds) && Number.isFinite(seconds) && seconds > 0) {
      blockMs = Math.min(seconds * 1000, 5 * 60_000);
    } else {
      const dateMs = Date.parse(retryAfter);
      if (!Number.isNaN(dateMs)) {
        blockMs = Math.min(dateMs - Date.now(), 5 * 60_000);
      }
    }
  }
  if (blockMs <= 0) return;
  refreshBlockedUntil = Date.now() + blockMs;
};
