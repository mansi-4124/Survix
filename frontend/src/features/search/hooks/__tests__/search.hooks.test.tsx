import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useGlobalSearch } from "../search.hooks";
import { searchApi } from "../../api/search.api";
import type { ReactNode } from "react";

vi.mock("../../api/search.api", () => ({
  searchApi: {
    globalSearch: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useGlobalSearch", () => {
  it("does not run for short queries", async () => {
    renderHook(() => useGlobalSearch("a"), { wrapper: createWrapper() });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(searchApi.globalSearch).not.toHaveBeenCalled();
  });

  it("runs search for valid queries", async () => {
    vi.mocked(searchApi.globalSearch).mockResolvedValue({
      surveys: [],
      polls: [],
      organizations: [],
      users: [],
      counts: { surveys: 0, polls: 0, organizations: 0, users: 0 },
    });

    const { result } = renderHook(() => useGlobalSearch("survey"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(searchApi.globalSearch).toHaveBeenCalledWith("survey", 6);
  });
});
