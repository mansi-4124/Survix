import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export const useForgotPassword = () =>
  useMutation({
    mutationFn: authApi.forgotPassword,
  });
