export const surveysKeys = {
  all: ["surveys"] as const,
  lists: () => [...surveysKeys.all, "list"] as const,
  publicList: () => [...surveysKeys.all, "public"] as const,
  detail: (surveyId: string) => [...surveysKeys.all, "detail", surveyId] as const,
  structure: (surveyId: string) =>
    [...surveysKeys.detail(surveyId), "structure"] as const,
  questions: (pageId: string) =>
    [...surveysKeys.all, "questions", pageId] as const,
  members: (surveyId: string) =>
    [...surveysKeys.detail(surveyId), "members"] as const,
};
