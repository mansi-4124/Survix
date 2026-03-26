import { useQuery } from "@tanstack/react-query";
import { searchApi } from "../api/search.api";

export const searchKeys = {
  all: ["global-search"] as const,
  query: (query: string) => [...searchKeys.all, query] as const,
};

export const useGlobalSearch = (query: string, limit = 6) =>
  useQuery({
    queryKey: searchKeys.query(query),
    queryFn: () => searchApi.globalSearch(query, limit),
    enabled: query.trim().length >= 2,
  });
