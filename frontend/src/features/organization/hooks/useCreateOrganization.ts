import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.createOrganization,
    onSuccess: async (organization) => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(organization.id),
      });
    },
  });
};
