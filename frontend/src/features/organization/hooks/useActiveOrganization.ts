import { useEffect } from "react";
import { useMyOrganizations } from "./useMyOrganizations";
import { useOrganizationStore } from "../store/organization.store";

export const useActiveOrganization = () => {
  const { data: organizations } = useMyOrganizations();
  const storedOrganizations = useOrganizationStore((s) => s.organizations);
  const activeOrganizationId = useOrganizationStore(
    (s) => s.activeOrganizationId,
  );
  const currentOrganization = useOrganizationStore((s) => s.currentOrganization);
  const setOrganizations = useOrganizationStore((s) => s.setOrganizations);
  const setActiveOrganizationId = useOrganizationStore(
    (s) => s.setActiveOrganizationId,
  );

  useEffect(() => {
    if (!organizations) {
      return;
    }

    setOrganizations(
      organizations.map((organization) => ({
        id: organization.id,
        name: organization.name,
      })),
    );
  }, [organizations, setOrganizations]);

  return {
    organizations: storedOrganizations,
    activeOrganizationId,
    currentOrganization,
    setActiveOrganizationId,
  };
};
