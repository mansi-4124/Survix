import type {
  AddSurveyMemberDtoRequest,
  CreateQuestionDtoRequest,
  CreateSurveyDtoRequest,
  MoveQuestionDtoRequest,
  ReorderQuestionsDtoRequest,
  UpdateQuestionDtoRequest,
  UpdateSurveyDtoRequest,
} from "@/api";
import { OpenAPI } from "@/api";
import { request } from "@/api/core/request";
import { SurveysService } from "@/api/services/SurveysService";
import { unwrapApiResponse } from "@/lib/api-response";

export type SurveySummary = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  visibility: "PUBLIC" | "PRIVATE";
  allowAnonymous: boolean;
  randomizeQuestions: boolean;
  organizationId?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  publishedAt?: string | null;
  role: "OWNER" | "ADMIN" | "EDITOR" | "ANALYST" | "VIEWER";
  createdAt: string;
  updatedAt: string;
};

export type PublicSurveySummary = {
  id: string;
  title: string;
  description?: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  allowAnonymous: boolean;
  randomizeQuestions: boolean;
  createdAt: string;
  hasResponded: boolean;
};

export type SurveyMember = {
  userId: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "ANALYST" | "VIEWER";
  assignedAt?: string | null;
  removedAt?: string | null;
  user: {
    id: string;
    email: string;
    username?: string | null;
    name?: string | null;
    avatar?: string | null;
  };
};

export const surveysApi = {
  createSurvey: async (data: CreateSurveyDtoRequest) =>
    unwrapApiResponse<{ id: string; status: string; publicLink: string }>(
      await SurveysService.surveyControllerCreateSurvey(data),
    ),

  getMySurveys: async () =>
    unwrapApiResponse<SurveySummary[]>(
      await request(OpenAPI, {
        method: "GET",
        url: "/surveys/my",
      }),
    ),

  updateSurvey: async (surveyId: string, data: UpdateSurveyDtoRequest) =>
    unwrapApiResponse<{ revision: number }>(
      await SurveysService.surveyControllerUpdateSurvey(surveyId, data),
    ),

  softDeleteSurvey: async (surveyId: string) =>
    unwrapApiResponse<void>(
      await SurveysService.surveyControllerSoftDeleteSurvey(surveyId),
    ),

  getSurveyForView: async (surveyId: string) =>
    unwrapApiResponse<any>(
      await SurveysService.surveyControllerGetSurveyForView(surveyId),
    ),

  publishSurvey: async (surveyId: string) =>
    unwrapApiResponse<{ status: string }>(
      await SurveysService.surveyControllerPublishSurvey(surveyId),
    ),

  closeSurvey: async (surveyId: string) =>
    unwrapApiResponse<{ status: string }>(
      await SurveysService.surveyControllerCloseSurvey(surveyId),
    ),

  duplicateSurvey: async (surveyId: string) =>
    unwrapApiResponse<{ newSurveyId: string }>(
      await SurveysService.surveyControllerDuplicateSurvey(surveyId),
    ),

  searchPublicSurveys: async (search?: string) =>
    unwrapApiResponse<PublicSurveySummary[]>(
      await request(OpenAPI, {
        method: "GET",
        url: "/surveys/public",
        ...(search && search.trim()
          ? { query: { search: search.trim() } }
          : {}),
      }),
    ),

  addMember: async (surveyId: string, data: AddSurveyMemberDtoRequest) =>
    unwrapApiResponse<any>(
      await SurveysService.surveyControllerAddMember(surveyId, data),
    ),

  listMembers: async (surveyId: string) =>
    unwrapApiResponse<SurveyMember[]>(
      await request(OpenAPI, {
        method: "GET",
        url: "/surveys/{surveyId}/members",
        path: {
          surveyId,
        },
      }),
    ),

  removeMember: async (surveyId: string, userId: string) =>
    unwrapApiResponse<void>(
      await SurveysService.surveyControllerRemoveMember(surveyId, userId),
    ),

  createPage: async (
    surveyId: string,
    data: { title: string; description?: string },
  ) =>
    unwrapApiResponse<{ id: string; order: number }>(
      await request(OpenAPI, {
        method: "POST",
        url: "/surveys/{surveyId}/pages",
        path: { surveyId },
        body: data,
        mediaType: "application/json",
      }),
    ),

  updatePage: async (
    pageId: string,
    data: { title?: string; description?: string },
  ) =>
    unwrapApiResponse<any>(
      await request(OpenAPI, {
        method: "PATCH",
        url: "/pages/{pageId}",
        path: { pageId },
        body: data,
        mediaType: "application/json",
      }),
    ),

  deletePage: async (pageId: string) =>
    unwrapApiResponse<void>(
      await request(OpenAPI, {
        method: "DELETE",
        url: "/pages/{pageId}",
        path: { pageId },
      }),
    ),

  createQuestion: async (pageId: string, data: CreateQuestionDtoRequest) =>
    unwrapApiResponse<{ id: string; order: number }>(
      await SurveysService.surveyControllerCreateQuestion(pageId, data),
    ),

  getQuestions: async (pageId: string) =>
    unwrapApiResponse<any[]>(
      await SurveysService.surveyControllerGetQuestions(pageId),
    ),

  updateQuestion: async (questionId: string, data: UpdateQuestionDtoRequest) =>
    unwrapApiResponse<any>(
      await SurveysService.surveyControllerUpdateQuestion(questionId, data),
    ),

  deleteQuestion: async (questionId: string) =>
    unwrapApiResponse<void>(
      await SurveysService.surveyControllerDeleteQuestion(questionId),
    ),

  reorderQuestions: async (pageId: string, data: ReorderQuestionsDtoRequest) =>
    unwrapApiResponse<{ message: string }>(
      await SurveysService.surveyControllerReorderQuestions(pageId, data),
    ),

  moveQuestion: async (questionId: string, data: MoveQuestionDtoRequest) =>
    unwrapApiResponse<void>(
      await SurveysService.surveyControllerMoveQuestion(questionId, data),
    ),

  getSurveyStructure: async (
    surveyId: string,
    token?: string | null,
    resultsMode?: boolean,
  ) =>
    unwrapApiResponse<any>(
      await request(OpenAPI, {
        method: "GET",
        url: "/surveys/{surveyId}/structure",
        path: { surveyId },
        query: {
          ...(token ? { token } : {}),
          ...(resultsMode ? { results: "true" } : {}),
        },
      }),
    ),
};
