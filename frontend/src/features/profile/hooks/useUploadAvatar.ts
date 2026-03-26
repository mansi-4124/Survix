import { useMutation } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const useUploadAvatar = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (user) => {
      if (accessToken) {
        setAuth(user, accessToken);
      } else {
        setAuth(user, null);
      }
    },
  });
};
