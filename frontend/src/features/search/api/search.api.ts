import { OpenAPI } from "@/api";
import { request } from "@/api/core/request";
import { unwrapApiResponse } from "@/lib/api-response";

export type GlobalSearchSurvey = {
  id: string;
  title: string;
  description?: string | null;
  visibility: string;
  status: string;
  allowAnonymous: boolean;
  randomizeQuestions: boolean;
  createdAt: string;
  startsAt?: string | null;
  endsAt?: string | null;
  hasResponded?: boolean;
};

export type GlobalSearchPoll = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  isActive: boolean;
  expiresAt: string;
  totalVotes: number;
};

export type GlobalSearchOrganization = {
  id: string;
  name: string;
  slug: string;
  visibility: string;
  accountType: string;
  logoUrl?: string | null;
};

export type GlobalSearchUser = {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  avatar?: string | null;
};

export type GlobalSearchCounts = {
  surveys: number;
  polls: number;
  organizations: number;
  users: number;
};

export type GlobalSearchResponse = {
  surveys: GlobalSearchSurvey[];
  polls: GlobalSearchPoll[];
  organizations: GlobalSearchOrganization[];
  users: GlobalSearchUser[];
  counts: GlobalSearchCounts;
};

export const searchApi = {
  globalSearch: async (query: string, limit = 6) =>
    unwrapApiResponse<GlobalSearchResponse>(
      await request(OpenAPI, {
        method: "GET",
        url: "/search/global",
        query: {
          q: query,
          limit,
        },
      }),
    ),
};
