import { beforeEach, describe, expect, it } from "vitest";
import { useOrganizationStore } from "../organization.store";

const resetStore = () => {
  useOrganizationStore.setState(
    {
      organizations: [],
      activeOrganizationId: null,
      currentOrganization: null,
      setOrganizations: useOrganizationStore.getState().setOrganizations,
      setActiveOrganizationId: useOrganizationStore.getState().setActiveOrganizationId,
    },
    true,
  );
};

describe("useOrganizationStore", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it("defaults active organization to first entry", () => {
    useOrganizationStore.getState().setOrganizations([
      { id: "org-1", name: "Survix" },
      { id: "org-2", name: "Labs" },
    ]);

    expect(useOrganizationStore.getState().activeOrganizationId).toBe("org-1");
    expect(useOrganizationStore.getState().currentOrganization).toEqual({
      id: "org-1",
      name: "Survix",
    });
  });

  it("keeps active organization when still available", () => {
    useOrganizationStore.getState().setOrganizations([
      { id: "org-1", name: "Survix" },
    ]);
    useOrganizationStore.getState().setActiveOrganizationId("org-1");

    useOrganizationStore.getState().setOrganizations([
      { id: "org-1", name: "Survix" },
      { id: "org-2", name: "Labs" },
    ]);

    expect(useOrganizationStore.getState().activeOrganizationId).toBe("org-1");
  });

  it("updates active organization and current organization", () => {
    useOrganizationStore.getState().setOrganizations([
      { id: "org-1", name: "Survix" },
      { id: "org-2", name: "Labs" },
    ]);

    useOrganizationStore.getState().setActiveOrganizationId("org-2");

    expect(useOrganizationStore.getState().currentOrganization).toEqual({
      id: "org-2",
      name: "Labs",
    });
  });

  it("rehydrates current organization from persisted state", async () => {
    localStorage.setItem(
      "survix-organization",
      JSON.stringify({
        state: {
          organizations: [
            { id: "org-1", name: "Survix" },
            { id: "org-2", name: "Labs" },
          ],
          activeOrganizationId: "org-2",
        },
        version: 0,
      }),
    );

    await useOrganizationStore.persist.rehydrate();

    expect(useOrganizationStore.getState().currentOrganization).toEqual({
      id: "org-2",
      name: "Labs",
    });
  });
});
