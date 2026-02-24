import type { TransferOwnershipDtoRequest } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

type TransferOwnershipInput = {
  orgId: string;
  data: TransferOwnershipDtoRequest;
};

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: TransferOwnershipInput) =>
      organizationApi.transferOwnership(orgId, data),
    onSuccess: async (_, { orgId }) => {
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
