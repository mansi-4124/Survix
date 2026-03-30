import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const useSearchOrganizationUsers = (orgId?: string, query?: string) => {
  const normalizedQuery = query?.trim() ?? "";

  return useQuery({
    queryKey:
      orgId && normalizedQuery
        ? organizationKeys.usersSearch(orgId, normalizedQuery)
        : organizationKeys.all,
    queryFn: () => organizationApi.searchUsers(orgId as string, normalizedQuery),
    enabled: !!orgId && normalizedQuery.length >= 2,
  });
};
