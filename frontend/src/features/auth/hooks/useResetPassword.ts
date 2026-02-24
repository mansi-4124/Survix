import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export const useResetPassword = () =>
  useMutation({
    mutationFn: authApi.resetPassword,
  });
