import axios from "axios";
import { OpenAPI } from "@/api";
import { request } from "@/api/core/request";
import { unwrapApiResponse } from "@/lib/api-response";
import type {
  PollDetails,
  PollResults,
  PollSummary,
  PollStatus,
  PollType,
  VotePayload,
} from "../types/poll";

type CreatePollPayload = {
  organizationId: string;
  title: string;
  description?: string;
  questions: Array<{
    text: string;
    type: PollType;
    options?: string[];
  }>;
  startsAt?: string;
  expiresAt: string;
  allowAnonymous?: boolean;
  allowMultipleVotes?: boolean;
  showLiveResults?: boolean;
};

type UpdatePollPayload = {
  title?: string;
  description?: string;
  expiresAt?: string;
  status?: PollStatus;
  allowAnonymous?: boolean;
  allowMultipleVotes?: boolean;
  showLiveResults?: boolean;
};

export const pollsApi = {
  createPoll: async (payload: CreatePollPayload) =>
    unwrapApiResponse<PollDetails>(
      await request(OpenAPI, {
        method: "POST",
        url: "/polls",
        body: payload,
        mediaType: "application/json",
      }),
    ),

  listMyPolls: async (organizationId: string) =>
    unwrapApiResponse<PollSummary[]>(
      await request(OpenAPI, {
        method: "GET",
        url: "/polls/my",
        query: {
          organizationId,
        },
      }),
    ),

  getPollForManagement: async (pollId: string) =>
    unwrapApiResponse<PollDetails>(
      await request(OpenAPI, {
        method: "GET",
        url: "/polls/{pollId}",
        path: { pollId },
      }),
    ),

  getPollForLiveView: async (pollId: string) =>
    unwrapApiResponse<PollDetails>(
      await request(OpenAPI, {
        method: "GET",
        url: "/polls/{pollId}/live",
        path: { pollId },
      }),
    ),

  getPollForJoinByCode: async (code: string) =>
    unwrapApiResponse<PollDetails>(
      await request(OpenAPI, {
        method: "GET",
        url: "/polls/code/{code}/live",
        path: { code },
      }),
    ),

  updatePoll: async (pollId: string, payload: UpdatePollPayload) =>
    unwrapApiResponse<PollDetails>(
      await request(OpenAPI, {
        method: "PATCH",
        url: "/polls/{pollId}",
        path: { pollId },
        body: payload,
        mediaType: "application/json",
      }),
    ),

  closePoll: async (pollId: string) =>
    unwrapApiResponse<{ status: string }>(
      await request(OpenAPI, {
        method: "POST",
        url: "/polls/{pollId}/close",
        path: { pollId },
      }),
    ),

  deletePoll: async (pollId: string) =>
    unwrapApiResponse<{ status: string }>(
      await request(OpenAPI, {
        method: "DELETE",
        url: "/polls/{pollId}",
        path: { pollId },
      }),
    ),

  getPollResults: async (pollId: string) =>
    unwrapApiResponse<PollResults>(
      await request(OpenAPI, {
        method: "GET",
        url: "/polls/{pollId}/results",
        path: { pollId },
      }),
    ),

  submitVote: async (pollId: string, payload: VotePayload) =>
    unwrapApiResponse<{ voteId: string; pollId: string; createdAt: string }>(
      await request(OpenAPI, {
        method: "POST",
        url: "/polls/{pollId}/votes",
        path: { pollId },
        body: payload,
        mediaType: "application/json",
      }),
    ),

  downloadCsv: async (pollId: string): Promise<Blob> => {
    const url = `${OpenAPI.BASE}/polls/${pollId}/responses/csv`;
    const response = await axios.get<Blob>(url, {
      responseType: "blob",
      withCredentials: OpenAPI.WITH_CREDENTIALS,
    });
    return response.data;
  },
};

export type { CreatePollPayload, UpdatePollPayload };
