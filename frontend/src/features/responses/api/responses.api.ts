import type { SaveAnswersDtoRequest } from "@/api";
import { OpenAPI } from "@/api";
import { request } from "@/api/core/request";
import { ResponsesService } from "@/api/services/ResponsesService";
import { unwrapApiResponse } from "@/lib/api-response";

export const responsesApi = {
  startResponse: async (surveyId: string, token?: string | null) =>
    unwrapApiResponse<any>(
      await request(OpenAPI, {
        method: "POST",
        url: "/surveys/{surveyId}/responses/start",
        path: { surveyId },
        ...(token ? { query: { token } } : {}),
      }),
    ),

  saveAnswers: async (responseId: string, data: SaveAnswersDtoRequest) =>
    unwrapApiResponse<any>(
      await ResponsesService.responseControllerSaveAnswers(responseId, data),
    ),

  submitResponse: async (responseId: string) =>
    unwrapApiResponse<any>(
      await ResponsesService.responseControllerSubmitResponse(responseId),
    ),

  reopenResponse: async (responseId: string) =>
    unwrapApiResponse<any>(
      await ResponsesService.responseControllerReopenResponse(responseId),
    ),

  deleteResponse: async (responseId: string) =>
    unwrapApiResponse<any>(
      await ResponsesService.responseControllerSoftDeleteResponse(responseId),
    ),
};
