import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useActiveOrganization } from "../useActiveOrganization";
import { useOrganizationStore } from "../../store/organization.store";

vi.mock("../useMyOrganizations", () => ({
  useMyOrganizations: vi.fn(),
}));

import { useMyOrganizations } from "../useMyOrganizations";

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

describe("useActiveOrganization", () => {
  beforeEach(() => {
    resetStore();
    vi.mocked(useMyOrganizations).mockReturnValue({
      data: [
        { id: "org-1", name: "Survix" },
        { id: "org-2", name: "Labs" },
      ],
    } as unknown as ReturnType<typeof useMyOrganizations>);
  });

  it("stores organizations and resolves active organization", async () => {
    renderHook(() => useActiveOrganization());

    await waitFor(() => {
      expect(useOrganizationStore.getState().organizations.length).toBe(2);
    });

    expect(useOrganizationStore.getState().activeOrganizationId).toBe("org-1");
    expect(useOrganizationStore.getState().currentOrganization).toEqual({
      id: "org-1",
      name: "Survix",
    });
  });
});
