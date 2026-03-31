import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrganizationRole, SurveyRole, SurveyStatus } from '@prisma/client';

@Injectable()
export class SurveyEditGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const survey = request.survey;
    const membership = request.surveyMembership;
    const organizationMembership = request.organizationMembership;

    if (!survey) {
      throw new ForbiddenException('Survey is not loaded');
    }

    if (
      survey.status !== SurveyStatus.DRAFT &&
      survey.status !== SurveyStatus.SCHEDULED
    ) {
      throw new ForbiddenException('Only draft surveys can be edited');
    }

    const canEditAsSurveyRole =
      !!membership &&
      (membership.role === SurveyRole.OWNER ||
        membership.role === SurveyRole.ADMIN ||
        membership.role === SurveyRole.EDITOR);
    const canEditAsOrganizationRole =
      !!organizationMembership &&
      organizationMembership.status === 'ACTIVE' &&
      (organizationMembership.role === OrganizationRole.OWNER ||
        organizationMembership.role === OrganizationRole.ADMIN);

    if (!canEditAsSurveyRole && !canEditAsOrganizationRole) {
      throw new ForbiddenException(
        'Only survey OWNER/EDITOR or organization OWNER/ADMIN can edit this survey',
      );
    }

    return true;
  }
}
