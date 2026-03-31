import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAuthInit } from "../useAuthInit";
import { useAuthStore } from "../../store/auth.store";
import { authApi } from "../../api/auth.api";
import type { UserResponseDto } from "@/api/models/UserResponseDto";

vi.mock("../../api/auth.api", () => ({
  authApi: {
    refresh: vi.fn(),
  },
}));

const baseUser: UserResponseDto = {
  id: "user-1",
  email: "alex@example.com",
};

const setStoreState = (partial: Partial<ReturnType<typeof useAuthStore.getState>>) => {
  useAuthStore.setState(
    {
      ...useAuthStore.getState(),
      ...partial,
    },
    true,
  );
};

describe("useAuthInit", () => {
  beforeEach(() => {
    const persist = (useAuthStore as unknown as { persist?: { hasHydrated: () => boolean } }).persist;
    if (persist) {
      vi.spyOn(persist, "hasHydrated").mockReturnValue(true);
    }
    setStoreState({
      user: null,
      accessToken: null,
      isInitializing: true,
      hasHydrated: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("sets auth and clears initializing on refresh success", async () => {
    vi.mocked(authApi.refresh).mockResolvedValue({
      user: baseUser,
      tokens: {
        accessToken: "token-123",
        accessTokenExpiresIn: 3600,
        refreshTokenExpiresIn: 7200,
      },
    });

    renderHook(() => useAuthInit());

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe("token-123");
    });
    expect(useAuthStore.getState().user).toEqual(baseUser);
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });

  it("clears auth on refresh errors (non-timeout)", async () => {
    vi.mocked(authApi.refresh).mockRejectedValue(new Error("server_error"));
    setStoreState({
      user: baseUser,
      accessToken: "stale-token",
    });

    renderHook(() => useAuthInit());

    await waitFor(() => {
      expect(useAuthStore.getState().isInitializing).toBe(false);
    });
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("preserves auth state on refresh timeout", async () => {
    vi.useFakeTimers();
    vi.mocked(authApi.refresh).mockImplementation(
      () => new Promise(() => {}),
    );
    setStoreState({
      user: baseUser,
      accessToken: "stale-token",
    });

    renderHook(() => useAuthInit());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(useAuthStore.getState().isInitializing).toBe(false);
    expect(useAuthStore.getState().user).toEqual(baseUser);
    expect(useAuthStore.getState().accessToken).toBe("stale-token");
  });
});
