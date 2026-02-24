import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const useOrganizationMembers = (orgId?: string) =>
  useQuery({
    queryKey: orgId ? organizationKeys.members(orgId) : organizationKeys.all,
    queryFn: () => organizationApi.listMembers(orgId as string),
    enabled: Boolean(orgId),
  });
