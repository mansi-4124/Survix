import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

type RemoveMemberInput = {
  orgId: string;
  userId: string;
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId }: RemoveMemberInput) =>
      organizationApi.removeMember(orgId, userId),
    onSuccess: async (_, { orgId }) => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.members(orgId),
      });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(orgId),
      });
    },
  });
};
