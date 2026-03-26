import { PollStatus, SurveyStatus, SurveyVisibility } from '@prisma/client';

export class PublicUserSurveyDtoResponse {
  id!: string;
  title!: string;
  description?: string | null;
  visibility!: SurveyVisibility;
  status!: SurveyStatus;
  allowAnonymous!: boolean;
  randomizeQuestions!: boolean;
  createdAt!: Date;
}

export class PublicUserPollDtoResponse {
  id!: string;
  title!: string;
  description?: string | null;
  status!: PollStatus;
  isActive!: boolean;
  expiresAt!: Date;
  totalVotes!: number;
}

export class PublicUserProfileDtoResponse {
  user!: {
    id: string;
    email?: string | null;
    username?: string | null;
    name?: string | null;
    avatar?: string | null;
    createdAt: Date;
  };
  surveys!: PublicUserSurveyDtoResponse[];
  polls!: PublicUserPollDtoResponse[];
  counts!: {
    surveys: number;
    polls: number;
    totalVotes: number;
  };
}
