import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const useMyOrganizations = () =>
  useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: organizationApi.getMyOrganizations,
  });
