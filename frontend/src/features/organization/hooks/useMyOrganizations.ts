import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const useMyOrganizations = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: organizationApi.getMyOrganizations,
    enabled: !!user,
  });
};