import type { SaveAnswersDtoRequest } from "@/api";
import { useMutation } from "@tanstack/react-query";
import { responsesApi } from "../api/responses.api";

export const useStartResponse = () =>
  useMutation({
    mutationFn: ({ surveyId, token }: { surveyId: string; token?: string | null }) =>
      responsesApi.startResponse(surveyId, token),
  });

export const useSaveAnswers = () =>
  useMutation({
    mutationFn: ({
      responseId,
      data,
    }: {
      responseId: string;
      data: SaveAnswersDtoRequest;
    }) => responsesApi.saveAnswers(responseId, data),
  });

export const useSubmitResponse = () =>
  useMutation({
    mutationFn: (responseId: string) => responsesApi.submitResponse(responseId),
  });

export const useReopenResponse = () =>
  useMutation({
    mutationFn: (responseId: string) => responsesApi.reopenResponse(responseId),
  });

export const useDeleteResponse = () =>
  useMutation({
    mutationFn: (responseId: string) => responsesApi.deleteResponse(responseId),
  });
