import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
    },
  });
};
