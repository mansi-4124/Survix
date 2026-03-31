import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchApi } from "../search.api";
import { request } from "@/api/core/request";
import { unwrapApiResponse } from "@/lib/api-response";

vi.mock("@/api/core/request", () => ({
  request: vi.fn(),
}));

vi.mock("@/lib/api-response", () => ({
  unwrapApiResponse: vi.fn(),
}));

describe("searchApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls global search with query and limit", async () => {
    vi.mocked(request).mockResolvedValue({ data: "payload" });
    vi.mocked(unwrapApiResponse).mockReturnValue("unwrapped");

    const result = await searchApi.globalSearch("survey", 8);

    expect(request).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        method: "GET",
        url: "/search/global",
        query: { q: "survey", limit: 8 },
      }),
    );
    expect(unwrapApiResponse).toHaveBeenCalledWith({ data: "payload" });
    expect(result).toBe("unwrapped");
  });
});
