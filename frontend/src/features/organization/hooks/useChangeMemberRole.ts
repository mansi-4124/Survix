import type { ChangeMemberRoleDtoRequest } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

type ChangeMemberRoleInput = {
  orgId: string;
  userId: string;
  data: ChangeMemberRoleDtoRequest;
};

export const useChangeMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId, data }: ChangeMemberRoleInput) =>
      organizationApi.changeMemberRole(orgId, userId, data),
    onSuccess: async (_, { orgId }) => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.members(orgId),
      });
    },
  });
};
