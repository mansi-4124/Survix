import type { UserResponseDto } from "@/api/models/UserResponseDto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAuthToken } from "@/lib/auth-token";

interface AuthState {
  user: UserResponseDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  hasHydrated: boolean;

  setAuth: (user: UserResponseDto, accessToken?: string | null) => void;
  clearAuth: () => void;
  setAccessToken: (token: string | null) => void;
  setInitializing: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: true,
      hasHydrated: false,

      setAuth: (user, accessToken) => {
        set({
          user,
          accessToken: accessToken ?? null,
          isAuthenticated: true,
        });
        setAuthToken(accessToken);
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        setAuthToken(null);
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
        setAuthToken(token);
      },

      setInitializing: (value) => {
        set({ isInitializing: value });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },
    }),
    {
      name: "survix-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        setAuthToken(state?.accessToken ?? null);
        useAuthStore.getState().setHasHydrated(true);
      },
    },
  ),
);
