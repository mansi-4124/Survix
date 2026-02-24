import type { UserResponseDto } from "@/api/models/UserResponseDto";
import { create } from "zustand";

interface AuthState {
  user: UserResponseDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  setAuth: (user: UserResponseDto, token: string) => void;
  clearAuth: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (user, token) => {
    localStorage.setItem("accessToken", token);
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setInitializing: (value) => {
    set({ isInitializing: value });
  },
}));
