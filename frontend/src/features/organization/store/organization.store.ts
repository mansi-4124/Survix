import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type OrganizationListItem = {
  id: string;
  name: string;
};

type OrganizationState = {
  organizations: OrganizationListItem[];
  activeOrganizationId: string | null;
  currentOrganization: OrganizationListItem | null;
  setOrganizations: (organizations: OrganizationListItem[]) => void;
  setActiveOrganizationId: (orgId: string | null) => void;
};

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organizations: [],
      activeOrganizationId: null,
      currentOrganization: null,
      setOrganizations: (organizations) => {
        const activeOrganizationId = get().activeOrganizationId;
        const resolvedActiveId =
          activeOrganizationId && organizations.some((org) => org.id === activeOrganizationId)
            ? activeOrganizationId
            : organizations[0]?.id ?? null;
        const currentOrganization =
          organizations.find((org) => org.id === resolvedActiveId) ?? null;

        set({
          organizations,
          activeOrganizationId: resolvedActiveId,
          currentOrganization,
        });
      },
      setActiveOrganizationId: (orgId) => {
        const currentOrganization =
          get().organizations.find((organization) => organization.id === orgId) ?? null;
        set({
          activeOrganizationId: orgId,
          currentOrganization,
        });
      },
    }),
    {
      name: "survix-organization",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        organizations: state.organizations,
        activeOrganizationId: state.activeOrganizationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const currentOrganization =
          state.organizations.find(
            (organization) => organization.id === state.activeOrganizationId,
          ) ?? null;
        state.currentOrganization = currentOrganization;
      },
    },
  ),
);
