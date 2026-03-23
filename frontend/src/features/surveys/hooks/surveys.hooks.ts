import type {
  AddSurveyMemberDtoRequest,
  CreateQuestionDtoRequest,
  CreateSurveyDtoRequest,
  MoveQuestionDtoRequest,
  ReorderQuestionsDtoRequest,
  UpdateQuestionDtoRequest,
  UpdateSurveyDtoRequest,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { surveysApi } from "../api/surveys.api";
import { surveysKeys } from "../api/surveys.keys";

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSurveyDtoRequest) => surveysApi.createSurvey(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.lists() });
      await queryClient.refetchQueries({ queryKey: surveysKeys.lists() });
    },
  });
};

export const useMySurveys = () =>
  useQuery({
    queryKey: surveysKeys.lists(),
    queryFn: surveysApi.getMySurveys,
    refetchOnMount: "always",
  });

export const usePublicSurveys = (search?: string) =>
  useQuery({
    queryKey: [...surveysKeys.publicList(), search ?? ""],
    queryFn: () => surveysApi.searchPublicSurveys(search),
    refetchOnMount: "always",
  });

export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: string; data: UpdateSurveyDtoRequest }) =>
      surveysApi.updateSurvey(surveyId, data),
    onSuccess: async (_, { surveyId }) => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) });
      await queryClient.invalidateQueries({
        queryKey: surveysKeys.structure(surveyId),
      });
    },
  });
};

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (surveyId: string) => surveysApi.softDeleteSurvey(surveyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.lists() });
    },
  });
};

export const usePublishSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (surveyId: string) => surveysApi.publishSurvey(surveyId),
    onSuccess: async (_, surveyId) => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) });
      await queryClient.invalidateQueries({
        queryKey: surveysKeys.structure(surveyId),
      });
    },
  });
};

export const useCloseSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (surveyId: string) => surveysApi.closeSurvey(surveyId),
    onSuccess: async (_, surveyId) => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) });
    },
  });
};

export const useDuplicateSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (surveyId: string) => surveysApi.duplicateSurvey(surveyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.lists() });
    },
  });
};

export const useSurveyForView = (surveyId?: string) =>
  useQuery({
    queryKey: surveyId ? surveysKeys.detail(surveyId) : surveysKeys.detail("unknown"),
    queryFn: () => surveysApi.getSurveyForView(surveyId as string),
    enabled: Boolean(surveyId),
  });

export const useSurveyStructure = (surveyId?: string, token?: string | null) =>
  useQuery({
    queryKey: surveyId
      ? [...surveysKeys.structure(surveyId), token ?? ""]
      : surveysKeys.structure("unknown"),
    queryFn: () => surveysApi.getSurveyStructure(surveyId as string, token),
    enabled: Boolean(surveyId),
  });

export const useSurveyQuestions = (pageId?: string) =>
  useQuery({
    queryKey: pageId ? surveysKeys.questions(pageId) : surveysKeys.questions("unknown"),
    queryFn: () => surveysApi.getQuestions(pageId as string),
    enabled: Boolean(pageId),
  });

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: string; data: { title: string; description?: string } }) =>
      surveysApi.createPage(surveyId, data),
    onSuccess: async (_, { surveyId }) => {
      await queryClient.invalidateQueries({
        queryKey: surveysKeys.structure(surveyId),
      });
      await queryClient.invalidateQueries({
        queryKey: surveysKeys.detail(surveyId),
      });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: string; data: { title?: string; description?: string } }) =>
      surveysApi.updatePage(pageId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.all });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => surveysApi.deletePage(pageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.all });
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: string; data: CreateQuestionDtoRequest }) =>
      surveysApi.createQuestion(pageId, data),
    onSuccess: async (_, { pageId }) => {
      await queryClient.invalidateQueries({
        queryKey: surveysKeys.questions(pageId),
      });
      await queryClient.invalidateQueries({ queryKey: surveysKeys.all });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: UpdateQuestionDtoRequest }) =>
      surveysApi.updateQuestion(questionId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.all });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => surveysApi.deleteQuestion(questionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.all });
    },
  });
};

export const useReorderQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: string; data: ReorderQuestionsDtoRequest }) =>
      surveysApi.reorderQuestions(pageId, data),
    onSuccess: async (_, { pageId }) => {
      await queryClient.invalidateQueries({
        queryKey: surveysKeys.questions(pageId),
      });
      await queryClient.invalidateQueries({ queryKey: surveysKeys.all });
    },
  });
};

export const useMoveQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: MoveQuestionDtoRequest }) =>
      surveysApi.moveQuestion(questionId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysKeys.all });
    },
  });
};

export const useSurveyMembers = (surveyId?: string) =>
  useQuery({
    queryKey: surveyId ? surveysKeys.members(surveyId) : surveysKeys.members("unknown"),
    queryFn: () => surveysApi.listMembers(surveyId as string),
    enabled: Boolean(surveyId),
  });

export const useAddSurveyMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: string; data: AddSurveyMemberDtoRequest }) =>
      surveysApi.addMember(surveyId, data),
    onSuccess: async (_, { surveyId }) => {
      await queryClient.invalidateQueries({
        queryKey: surveysKeys.members(surveyId),
      });
      await queryClient.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) });
    },
  });
};

export const useRemoveSurveyMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surveyId, userId }: { surveyId: string; userId: string }) =>
      surveysApi.removeMember(surveyId, userId),
    onSuccess: async (_, { surveyId }) => {
      await queryClient.invalidateQueries({
        queryKey: surveysKeys.members(surveyId),
      });
      await queryClient.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) });
    },
  });
};
