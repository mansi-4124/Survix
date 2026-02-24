import { Response as SurveyResponse, Survey, SurveyMember } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      anonymousId?: string;
      survey?: Survey;
      surveyMembership?: SurveyMember | null;
      surveyAccessType?: 'MEMBER' | 'TOKEN' | 'PUBLIC';
      responseEntity?: SurveyResponse;
    }
  }
}

export {};
