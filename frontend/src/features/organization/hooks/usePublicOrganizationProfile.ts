import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "../api/organization.api";
import { organizationKeys } from "../api/organization.keys";

export const usePublicOrganizationProfile = (slug?: string) =>
  useQuery({
    queryKey: slug
      ? [...organizationKeys.details(), "public", slug]
      : [...organizationKeys.details(), "public", "unknown"],
    queryFn: () => organizationApi.getPublicOrganizationProfile(slug as string),
    enabled: Boolean(slug),
  });
