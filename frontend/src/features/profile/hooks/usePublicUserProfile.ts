import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";

export const usePublicUserProfile = (username?: string) =>
  useQuery({
    queryKey: ["public-user-profile", username ?? "unknown"],
    queryFn: () => profileApi.getPublicProfile(username as string),
    enabled: Boolean(username),
  });
