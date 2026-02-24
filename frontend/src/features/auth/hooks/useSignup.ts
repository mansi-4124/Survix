import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export const useSignup = () =>
  useMutation({
    mutationFn: authApi.signup,
  });
