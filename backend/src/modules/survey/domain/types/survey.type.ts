import { SurveyStatus, SurveyVisibility } from '@prisma/client';

export type SurveyDomain = {
  id: string;
  title: string;
  description?: string | null;
  organizationId?: string | null;
  ownerUserId?: string | null;
  status: SurveyStatus;
  visibility: SurveyVisibility;
  allowAnonymous: boolean;
  allowMultipleResponses: boolean;
  randomizeQuestions: boolean;
  revision: number;
  startDate?: Date | null;
  endDate?: Date | null;
  publishedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
