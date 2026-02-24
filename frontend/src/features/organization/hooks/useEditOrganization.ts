import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";
import type { UpdateOrganizationDtoRequest } from "@/api";

type EditOrganizationInput = {
  orgId: string;
  data: UpdateOrganizationDtoRequest;
};

export const useEditOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: EditOrganizationInput) =>
      organizationApi.editOrganization(orgId, data),
    onSuccess: async (_, { orgId }) => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(orgId),
      });
    },
  });
};
