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
    accessToken,
    setAccessToken,
  } = useAuthStore();
  const initializedRef = useRef(false);
  const refreshWithTimeout = async (timeoutMs: number) => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error("auth_refresh_timeout"));
      }, timeoutMs);
    });
    try {
      return await Promise.race([authApi.refresh(), timeoutPromise]);
    } finally {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
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
      const currentState = useAuthStore.getState();
      const hasLocalSession = Boolean(currentState.user);

      try {
        if (hasLocalSession) {
          if (accessToken) {
            setAccessToken(accessToken);
          }
        }

        const refreshed = await refreshWithTimeout(8000);
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
    accessToken,
    setAccessToken,
  ]);
};
