import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

type SuspendMemberInput = {
  orgId: string;
  userId: string;
};

export const useSuspendMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId }: SuspendMemberInput) =>
      organizationApi.suspendMember(orgId, userId),
    onSuccess: async (_, { orgId }) => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.members(orgId),
      });
    },
  });
};
