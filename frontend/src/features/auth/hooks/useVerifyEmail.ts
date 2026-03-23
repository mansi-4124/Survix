import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export const useVerifyEmail = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      const { user, tokens } = data;
      setAuth(user, tokens?.accessToken);
    },
  });
};
