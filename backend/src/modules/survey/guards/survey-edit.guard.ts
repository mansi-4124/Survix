import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SurveyRole, SurveyStatus } from '@prisma/client';

@Injectable()
export class SurveyEditGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const survey = request.survey;
    const membership = request.surveyMembership;

    if (!survey) {
      throw new ForbiddenException('Survey is not loaded');
    }

    if (survey.status !== SurveyStatus.DRAFT) {
      throw new ForbiddenException('Only draft surveys can be edited');
    }

    if (!membership) {
      throw new ForbiddenException('Survey membership required');
    }

    if (![SurveyRole.OWNER, SurveyRole.EDITOR].includes(membership.role)) {
      throw new ForbiddenException(
        'Only OWNER or EDITOR can edit this survey',
      );
    }

    return true;
  }
}
