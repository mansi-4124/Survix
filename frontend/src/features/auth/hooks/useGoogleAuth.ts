import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export const useGoogleAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: authApi.googleAuth,
    onSuccess: (data) => {
      const { user, tokens } = data;
      setAuth(user, tokens?.accessToken);
    },
  });
};
