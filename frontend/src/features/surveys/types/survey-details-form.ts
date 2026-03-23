import type { UpdateSurveyDtoRequest } from "@/api";

export type SurveyDetailsForm = {
  title: string;
  description: string;
  visibility: UpdateSurveyDtoRequest.visibility;
  allowAnonymous: boolean;
  allowMultipleResponses: boolean;
  startDate: string;
  endDate: string;
};

