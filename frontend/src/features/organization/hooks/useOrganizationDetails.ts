import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const useOrganizationDetails = (orgId?: string) =>
  useQuery({
    queryKey: orgId ? organizationKeys.detail(orgId) : organizationKeys.details(),
    queryFn: () => organizationApi.getOrganizationDetails(orgId as string),
    enabled: Boolean(orgId),
  });
