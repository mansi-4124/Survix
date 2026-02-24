import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

type ReactivateMemberInput = {
  orgId: string;
  userId: string;
};

export const useReactivateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId }: ReactivateMemberInput) =>
      organizationApi.reactivateMember(orgId, userId),
    onSuccess: async (_, { orgId }) => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.members(orgId),
      });
    },
  });
};
