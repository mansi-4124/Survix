import type { UserResponseDto } from "@/api/models/UserResponseDto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAuthToken } from "@/lib/auth-token";

interface AuthState {
  user: UserResponseDto | null;
  accessToken: string | null;
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
      isInitializing: true,
      hasHydrated: false,

      setAuth: (user, accessToken) => {
        set({
          user,
          accessToken: accessToken ?? null,
        });
        setAuthToken(accessToken);
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
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
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAuthToken(state?.accessToken ?? null);
        }
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
