import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { useStartResponse, useSubmitResponse } from "../responses.hooks";
import { responsesApi } from "../../api/responses.api";
import type { ReactNode } from "react";

vi.mock("../../api/responses.api", () => ({
  responsesApi: {
    startResponse: vi.fn(),
    submitResponse: vi.fn(),
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

describe("responses hooks", () => {
  it("calls start response mutation", async () => {
    vi.mocked(responsesApi.startResponse).mockResolvedValue({ id: "resp-1" });

    const { result } = renderHook(() => useStartResponse(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ surveyId: "survey-1", token: "token-1" });
    });

    expect(responsesApi.startResponse).toHaveBeenCalledWith("survey-1", "token-1");
  });

  it("calls submit response mutation", async () => {
    vi.mocked(responsesApi.submitResponse).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useSubmitResponse(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync("resp-1");
    });

    expect(responsesApi.submitResponse).toHaveBeenCalledWith("resp-1");
  });
});
