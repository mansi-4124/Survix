import {
  OrganizationAccountType,
  OrganizationVisibility,
  SurveyVisibility,
  SurveyStatus,
  PollStatus,
} from '@prisma/client';

export class PublicOrganizationSurveyDtoResponse {
  id!: string;
  title!: string;
  description?: string | null;
  visibility!: SurveyVisibility;
  status!: SurveyStatus;
  allowAnonymous!: boolean;
  randomizeQuestions!: boolean;
  createdAt!: Date;
}

export class PublicOrganizationPollDtoResponse {
  id!: string;
  title!: string;
  description?: string | null;
  status!: PollStatus;
  isActive!: boolean;
  expiresAt!: Date;
  totalVotes!: number;
}

export class PublicOrganizationDtoResponse {
  organization!: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    accountType: OrganizationAccountType;
    description?: string | null;
    industry?: string | null;
    size?: string | null;
    websiteUrl?: string | null;
    contactEmail?: string | null;
    visibility: OrganizationVisibility;
  };
  surveys!: PublicOrganizationSurveyDtoResponse[];
  polls!: PublicOrganizationPollDtoResponse[];
}
