import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const useSoftDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.softDeleteOrganization,
    onSuccess: async (_, orgId) => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(orgId),
      });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.members(orgId),
      });
    },
  });
};
