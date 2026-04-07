import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { surveysApi } from "@/features/surveys/api/surveys.api";
import { surveysKeys } from "@/features/surveys/api/surveys.keys";
import { organizationApi } from "@/features/organization/api/organization.api";
import { organizationKeys } from "@/features/organization/api/organization.keys";
import { pollsApi } from "@/features/polls/api/polls.api";
import { pollsKeys } from "@/features/polls/api/polls.keys";

export const useBootstrapAppData = () => {
  const queryClient = useQueryClient();
  const { user, hasHydrated } = useAuthStore();
  const activeOrganizationId = useOrganizationStore(
    (s) => s.activeOrganizationId,
  );

  const bootstrappedRef = useRef(false);
  const bootstrappedOrgRef = useRef<string | null>(null);

  // Prefetch surveys + organizations once auth is ready
  useEffect(() => {
    if (!hasHydrated || !user || bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    queryClient.prefetchQuery({
      queryKey: surveysKeys.lists(),
      queryFn: surveysApi.getMySurveys,
    });

    queryClient.prefetchQuery({
      queryKey: organizationKeys.lists(),
      queryFn: organizationApi.getMyOrganizations,
    });
  }, [hasHydrated, user, queryClient]);

  // Prefetch polls once we have an active org ID (set after orgs load)
  useEffect(() => {
    if (!hasHydrated || !user || !activeOrganizationId) return;
    if (bootstrappedOrgRef.current === activeOrganizationId) return;
    bootstrappedOrgRef.current = activeOrganizationId;

    queryClient.prefetchQuery({
      queryKey: pollsKeys.listByOrg(activeOrganizationId),
      queryFn: () => pollsApi.listMyPolls(activeOrganizationId),
    });
  }, [hasHydrated, user, activeOrganizationId, queryClient]);
};
