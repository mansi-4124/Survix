import {
  OrganizationMember,
  Poll,
  Response as SurveyResponse,
  Survey,
  SurveyMember,
} from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      anonymousId?: string;
      survey?: Survey;
      surveyMembership?: SurveyMember | null;
      organizationMembership?: OrganizationMember | null;
      surveyAccessType?: 'MEMBER' | 'TOKEN' | 'PUBLIC';
      responseEntity?: SurveyResponse;
      poll?: Pick<Poll, 'id' | 'organizationId'>;
    }
  }
}

export {};
