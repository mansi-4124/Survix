import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pollsApi, type CreatePollPayload, type UpdatePollPayload } from "../api/polls.api";
import { pollsKeys } from "../api/polls.keys";

export const useMyPolls = (organizationId?: string) =>
  useQuery({
    queryKey: organizationId
      ? pollsKeys.listByOrg(organizationId)
      : pollsKeys.listByOrg("unknown"),
    queryFn: () => pollsApi.listMyPolls(organizationId as string),
    enabled: Boolean(organizationId),
    refetchOnMount: "always",
  });

export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePollPayload) => pollsApi.createPoll(payload),
    onSuccess: async (createdPoll) => {
      await queryClient.invalidateQueries({ queryKey: pollsKeys.lists() });
      await queryClient.setQueryData(
        pollsKeys.detail(createdPoll.id),
        createdPoll,
      );
    },
  });
};

export const usePollForManagement = (pollId?: string) =>
  useQuery({
    queryKey: pollId ? pollsKeys.detail(pollId) : pollsKeys.detail("unknown"),
    queryFn: () => pollsApi.getPollForManagement(pollId as string),
    enabled: Boolean(pollId),
  });

export const usePollForLiveView = (pollId?: string) =>
  useQuery({
    queryKey: pollId ? pollsKeys.detail(pollId) : pollsKeys.detail("unknown"),
    queryFn: () => pollsApi.getPollForLiveView(pollId as string),
    enabled: Boolean(pollId),
    refetchInterval: 5000,
  });

export const usePollForJoinByCode = (code?: string) =>
  useQuery({
    queryKey: code ? pollsKeys.detailsByCode(code) : pollsKeys.detailsByCode("unknown"),
    queryFn: () => pollsApi.getPollForJoinByCode(code as string),
    enabled: Boolean(code),
    retry: false,
  });

export const usePollResults = (pollId?: string, live = false) =>
  useQuery({
    queryKey: pollId ? pollsKeys.results(pollId) : pollsKeys.results("unknown"),
    queryFn: () => pollsApi.getPollResults(pollId as string),
    enabled: Boolean(pollId),
    refetchInterval: (query) => {
      if (!live) {
        return 10000;
      }

      const data = query.state.data;
      if (!data || data.isActive) {
        return 2000;
      }

      return false;
    },
  });

export const useUpdatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pollId, payload }: { pollId: string; payload: UpdatePollPayload }) =>
      pollsApi.updatePoll(pollId, payload),
    onSuccess: async (poll) => {
      await queryClient.invalidateQueries({ queryKey: pollsKeys.lists() });
      await queryClient.setQueryData(pollsKeys.detail(poll.id), poll);
    },
  });
};

export const useClosePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => pollsApi.closePoll(pollId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pollsKeys.all });
    },
  });
};

export const useDeletePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => pollsApi.deletePoll(pollId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pollsKeys.all });
    },
  });
};

export const useSubmitPollVote = () =>
  useMutation({
    mutationFn: ({
      pollId,
      payload,
    }: {
      pollId: string;
      payload: {
        questionId: string;
        optionId?: string;
        wordAnswer?: string;
        sessionId?: string;
        participantName?: string;
      };
    }) =>
      pollsApi.submitVote(pollId, payload),
  });
