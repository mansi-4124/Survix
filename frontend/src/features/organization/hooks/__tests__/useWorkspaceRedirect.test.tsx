import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWorkspaceRedirect } from "../useWorkspaceRedirect";
import { useOrganizationStore } from "../../store/organization.store";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

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

describe("useWorkspaceRedirect", () => {
  beforeEach(() => {
    resetStore();
    navigateMock.mockClear();
  });

  it("sets active organization and navigates to dashboard by default", () => {
    const { result } = renderHook(() => useWorkspaceRedirect());

    act(() => {
      result.current("org-1");
    });

    expect(useOrganizationStore.getState().activeOrganizationId).toBe("org-1");
    expect(navigateMock).toHaveBeenCalledWith("/app/org/org-1/dashboard", {
      replace: undefined,
    });
  });

  it("supports custom path and replace option", () => {
    const { result } = renderHook(() => useWorkspaceRedirect());

    act(() => {
      result.current("org-2", { path: "/settings", replace: true });
    });

    expect(navigateMock).toHaveBeenCalledWith("/app/org/org-2/settings", {
      replace: true,
    });
  });
});
