import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../auth.store";
import type { UserResponseDto } from "@/api/models/UserResponseDto";
import { setAuthToken } from "@/lib/auth-token";

vi.mock("@/lib/auth-token", () => ({
  setAuthToken: vi.fn(),
}));

const baseUser: UserResponseDto = {
  id: "user-1",
  email: "alex@example.com",
};

const resetStore = () => {
  useAuthStore.setState(
    {
      user: null,
      accessToken: null,
      isInitializing: true,
      hasHydrated: false,
      setAuth: useAuthStore.getState().setAuth,
      clearAuth: useAuthStore.getState().clearAuth,
      setAccessToken: useAuthStore.getState().setAccessToken,
      setInitializing: useAuthStore.getState().setInitializing,
      setHasHydrated: useAuthStore.getState().setHasHydrated,
    },
    true,
  );
};

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
    vi.mocked(setAuthToken).mockClear();
  });

  it("sets user and access token via setAuth", () => {
    useAuthStore.getState().setAuth(baseUser, "token-123");

    expect(useAuthStore.getState().user).toEqual(baseUser);
    expect(useAuthStore.getState().accessToken).toBe("token-123");
    expect(setAuthToken).toHaveBeenCalledWith("token-123");
  });

  it("clears user and access token via clearAuth", () => {
    useAuthStore.getState().setAuth(baseUser, "token-123");

    useAuthStore.getState().clearAuth();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(setAuthToken).toHaveBeenLastCalledWith(null);
  });

  it("updates access token independently", () => {
    useAuthStore.getState().setAccessToken("token-xyz");

    expect(useAuthStore.getState().accessToken).toBe("token-xyz");
    expect(setAuthToken).toHaveBeenCalledWith("token-xyz");
  });

  it("rehydrates persisted auth and flags hydration complete", async () => {
    localStorage.setItem(
      "survix-auth",
      JSON.stringify({
        state: {
          user: baseUser,
          accessToken: "token-abc",
        },
        version: 0,
      }),
    );

    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().user).toEqual(baseUser);
    expect(useAuthStore.getState().accessToken).toBe("token-abc");
    expect(useAuthStore.getState().hasHydrated).toBe(true);
    expect(setAuthToken).toHaveBeenCalledWith("token-abc");
  });
});
