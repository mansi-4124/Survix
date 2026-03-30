import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export const useAuthInit = () => {
  const {
    setAuth,
    clearAuth,
    setInitializing,
    hasHydrated,
    setHasHydrated,
  } = useAuthStore();
  const initializedRef = useRef(false);
  const refreshWithTimeout = async (timeoutMs: number) => {
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
    }, timeoutMs);
    try {
      const result = await authApi.refresh();
      if (timedOut) {
        throw new Error("auth_refresh_timeout");
      }
      return result;
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  // Subscribe to persist hydration completion (handles async rehydration)
  useEffect(() => {
    const persist = (useAuthStore as unknown as { persist?: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }).persist;
    if (!persist) {
      setHasHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    const fallbackId = window.setTimeout(() => {
      if (!useAuthStore.getState().hasHydrated) {
        setHasHydrated(true);
      }
    }, 1000);
    return () => {
      window.clearTimeout(fallbackId);
      unsub();
    };
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const initAuth = async () => {
      try {
        const refreshed = await refreshWithTimeout(5000);
        const { user, tokens } = refreshed;
        setAuth(user, tokens?.accessToken);
      } catch (error) {
        clearAuth();
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, [
    setAuth,
    clearAuth,
    setInitializing,
    hasHydrated,
  ]);
};
