import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.acceptInvite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
};
