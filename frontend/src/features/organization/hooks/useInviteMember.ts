import type { InviteMemberDtoRequest } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

type InviteMemberInput = {
  orgId: string;
  data: InviteMemberDtoRequest;
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: InviteMemberInput) =>
      organizationApi.inviteMember(orgId, data),
    onSuccess: async (_, { orgId }) => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.members(orgId),
      });
    },
  });
};
