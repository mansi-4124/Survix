import { beforeEach, describe, expect, it, vi } from "vitest";
import { responsesApi } from "../responses.api";
import { request } from "@/api/core/request";
import { unwrapApiResponse } from "@/lib/api-response";
import { ResponsesService } from "@/api/services/ResponsesService";

vi.mock("@/api/core/request", () => ({
  request: vi.fn(),
}));

vi.mock("@/lib/api-response", () => ({
  unwrapApiResponse: vi.fn(),
}));

vi.mock("@/api/services/ResponsesService", () => ({
  ResponsesService: {
    responseControllerSaveAnswers: vi.fn(),
    responseControllerSubmitResponse: vi.fn(),
    responseControllerReopenResponse: vi.fn(),
    responseControllerSoftDeleteResponse: vi.fn(),
  },
}));

describe("responsesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts response with token when provided", async () => {
    vi.mocked(request).mockResolvedValue({ data: "payload" });
    vi.mocked(unwrapApiResponse).mockReturnValue("unwrapped");

    const result = await responsesApi.startResponse("survey-1", "token-1");

    expect(request).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        method: "POST",
        url: "/surveys/{surveyId}/responses/start",
        path: { surveyId: "survey-1" },
        query: { token: "token-1" },
      }),
    );
    expect(result).toBe("unwrapped");
  });

  it("saves answers via service", async () => {
    vi.mocked(ResponsesService.responseControllerSaveAnswers).mockResolvedValue({
      data: "payload",
    });
    vi.mocked(unwrapApiResponse).mockReturnValue("unwrapped");

    const result = await responsesApi.saveAnswers("resp-1", {
      answers: [],
    });

    expect(ResponsesService.responseControllerSaveAnswers).toHaveBeenCalledWith(
      "resp-1",
      { answers: [] },
    );
    expect(result).toBe("unwrapped");
  });

  it("submits, reopens, and deletes responses", async () => {
    vi.mocked(ResponsesService.responseControllerSubmitResponse).mockResolvedValue({
      data: "payload",
    });
    vi.mocked(ResponsesService.responseControllerReopenResponse).mockResolvedValue({
      data: "payload",
    });
    vi.mocked(ResponsesService.responseControllerSoftDeleteResponse).mockResolvedValue({
      data: "payload",
    });
    vi.mocked(unwrapApiResponse).mockReturnValue("unwrapped");

    await responsesApi.submitResponse("resp-1");
    await responsesApi.reopenResponse("resp-2");
    await responsesApi.deleteResponse("resp-3");

    expect(ResponsesService.responseControllerSubmitResponse).toHaveBeenCalledWith("resp-1");
    expect(ResponsesService.responseControllerReopenResponse).toHaveBeenCalledWith("resp-2");
    expect(ResponsesService.responseControllerSoftDeleteResponse).toHaveBeenCalledWith("resp-3");
  });
});
