import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

type UploadLogoInput = {
  orgId: string;
  file: File;
};

export const useUploadOrganizationLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, file }: UploadLogoInput) =>
      organizationApi.uploadOrganizationLogo(orgId, file),
    onSuccess: async (_, { orgId }) => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(orgId),
      });
    },
  });
};
