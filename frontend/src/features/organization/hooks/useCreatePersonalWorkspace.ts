import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const useCreatePersonalWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.createPersonalWorkspace,
    onSuccess: async (organization) => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(organization.id),
      });
    },
  });
};
