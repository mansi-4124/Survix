import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { mediaApi } from "../media.api";
import { OpenAPI } from "@/api";
import { useAuthStore } from "@/features/auth/store/auth.store";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

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

describe("mediaApi", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    OpenAPI.BASE = "http://example.com";
    OpenAPI.WITH_CREDENTIALS = true;
  });

  it("uploads file with authorization header when token exists", async () => {
    useAuthStore.getState().setAccessToken("token-123");
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        id: "media-1",
        surveyId: "survey-1",
        url: "http://example.com/file.png",
        storageKey: "key-1",
      },
    });

    const file = new File(["data"], "file.png", { type: "image/png" });
    await mediaApi.uploadFile("survey-1", file);

    expect(axios.post).toHaveBeenCalledWith(
      "http://example.com/media/upload?surveyId=survey-1",
      expect.any(FormData),
      expect.objectContaining({
        headers: { Authorization: "Bearer token-123" },
        withCredentials: true,
      }),
    );
  });

  it("handles wrapped response payloads", async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        data: {
          id: "media-2",
          surveyId: "survey-2",
          url: "http://example.com/file.png",
          storageKey: "key-2",
        },
      },
    });

    const file = new File(["data"], "file.png", { type: "image/png" });
    const result = await mediaApi.uploadFile("survey-2", file);

    expect(result.id).toBe("media-2");
  });
});
