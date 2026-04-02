import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export const useResendOtp = () =>
  useMutation({
    mutationFn: authApi.resendOtp,
  });
