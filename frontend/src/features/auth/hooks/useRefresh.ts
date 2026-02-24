import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export const useRefresh = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: authApi.refresh,
    onSuccess: (data) => {
      const { user, tokens } = data;
      setAuth(user, tokens.accessToken);
    },
  });
};
