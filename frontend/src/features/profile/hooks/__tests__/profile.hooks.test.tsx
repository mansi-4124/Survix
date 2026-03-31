import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { usePublicUserProfile } from "../usePublicUserProfile";
import { useUploadAvatar } from "../useUploadAvatar";
import { profileApi } from "../../api/profile.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { UserResponseDto } from "@/api/models/UserResponseDto";
import type { ReactNode } from "react";

vi.mock("../../api/profile.api", () => ({
  profileApi: {
    getPublicProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const resetAuthStore = () => {
  useAuthStore.setState(
    {
      user: null,
      accessToken: null,
      isInitializing: false,
      hasHydrated: true,
      setAuth: useAuthStore.getState().setAuth,
      clearAuth: useAuthStore.getState().clearAuth,
      setAccessToken: useAuthStore.getState().setAccessToken,
      setInitializing: useAuthStore.getState().setInitializing,
      setHasHydrated: useAuthStore.getState().setHasHydrated,
    },
    true,
  );
};

describe("profile hooks", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  it("fetches public profile when username is provided", async () => {
    vi.mocked(profileApi.getPublicProfile).mockResolvedValue({
      user: { id: "u1", createdAt: "" },
      surveys: [],
      polls: [],
      counts: { surveys: 0, polls: 0, totalVotes: 0 },
    });

    const { result } = renderHook(() => usePublicUserProfile("alex"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.getPublicProfile).toHaveBeenCalledWith("alex");
  });

  it("updates auth user after uploading avatar", async () => {
    const user: UserResponseDto = { id: "u1", email: "a@b.com" };
    vi.mocked(profileApi.uploadAvatar).mockResolvedValue(user);
    useAuthStore.getState().setAccessToken("token-123");

    const { result } = renderHook(() => useUploadAvatar(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(new File(["avatar"], "avatar.png"));
    });

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().accessToken).toBe("token-123");
  });
});
