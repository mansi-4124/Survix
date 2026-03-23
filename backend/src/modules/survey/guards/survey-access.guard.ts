import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  OrganizationRole,
  SurveyStatus,
  SurveyVisibility,
} from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { TokenPayload } from 'src/modules/auth/domain/types/token-payload.type';
import { SurveyAccessTypeDomain } from '../domain/enums/survey-access-type.enum';
import { SurveyAccessTokenService } from '../services/survey-access-token.service';
import { SURVEY_TOKENS } from '../survey.tokens';

@Injectable()
export class SurveyAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SURVEY_TOKENS.SURVEY_ACCESS_TOKEN_SERVICE)
    private readonly surveyAccessTokenService: SurveyAccessTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as TokenPayload | undefined;
    const currentUserId = user?.sub;

    const surveyId = await this.resolveSurveyId(request.params, request.query);

    if (!surveyId) {
      throw new NotFoundException('Survey id is missing');
    }

    const survey = await this.prisma.survey.findFirst({
      where: {
        id: surveyId,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      include: {
        members: currentUserId
          ? {
              where: {
                userId: currentUserId,
                removedAt: null,
              },
            }
          : false,
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const membership = Array.isArray(survey.members)
      ? (survey.members[0] ?? null)
      : null;
    const isOwner = Boolean(
      currentUserId && survey.ownerUserId === currentUserId,
    );
    const organizationMembership =
      currentUserId && survey.organizationId
        ? await this.prisma.organizationMember.findUnique({
            where: {
              organizationId_userId: {
                organizationId: survey.organizationId,
                userId: currentUserId,
              },
            },
          })
        : null;

    const isOrgAdmin =
      organizationMembership &&
      organizationMembership.status === 'ACTIVE' &&
      (organizationMembership.role === OrganizationRole.OWNER ||
        organizationMembership.role === OrganizationRole.ADMIN);

    const now = new Date();
    const accessToken = request.query?.token as string | undefined;

    if (accessToken) {
      if (survey.status !== SurveyStatus.PUBLISHED) {
        throw new ForbiddenException('Survey is not published');
      }
      if (survey.endDate && survey.endDate <= now) {
        throw new ForbiddenException('Survey has ended');
      }

      const tokenPayload =
        await this.surveyAccessTokenService.validateToken(accessToken);

      if (!tokenPayload || tokenPayload.surveyId !== survey.id) {
        throw new ForbiddenException('Invalid survey access token');
      }

      if (!currentUserId) {
        throw new ForbiddenException(
          'Private surveys do not allow anonymous access',
        );
      }

      if (tokenPayload.userId !== currentUserId) {
        throw new ForbiddenException('Survey token does not belong to this user');
      }

      request.survey = survey;
      request.surveyMembership = membership;
      request.organizationMembership = organizationMembership;
      request.surveyAccessType = SurveyAccessTypeDomain.TOKEN;
      return true;
    }

    if (membership || isOwner || isOrgAdmin) {
      request.survey = survey;
      request.surveyMembership = membership;
      request.organizationMembership = organizationMembership;
      request.surveyAccessType = SurveyAccessTypeDomain.MEMBER;
      return true;
    }

    if (survey.visibility === SurveyVisibility.PUBLIC) {
      // Public surveys are only accessible once published for non-members.
      if (survey.status !== SurveyStatus.PUBLISHED) {
        throw new ForbiddenException('Survey is not published');
      }
      if (survey.endDate && survey.endDate <= now) {
        throw new ForbiddenException('Survey has ended');
      }

      if (!survey.allowAnonymous && !currentUserId) {
        throw new UnauthorizedException(
          'Authentication required for this survey',
        );
      }

      request.survey = survey;
      request.surveyMembership = membership;
      request.organizationMembership = organizationMembership;
      request.surveyAccessType = SurveyAccessTypeDomain.PUBLIC;
      return true;
    }

    throw new ForbiddenException('Access denied for private survey');
  }

  private async resolveSurveyId(
    params: Record<string, string | undefined>,
    query?: Record<string, string | undefined>,
  ): Promise<string | null> {
    if (params.surveyId) {
      return params.surveyId;
    }

    if (params.pageId) {
      const page = await this.prisma.surveyPage.findUnique({
        where: { id: params.pageId },
        select: { surveyId: true },
      });
      return page?.surveyId ?? null;
    }

    if (params.questionId) {
      const question = await this.prisma.question.findUnique({
        where: { id: params.questionId },
        include: {
          page: {
            select: {
              surveyId: true,
            },
          },
        },
      });
      return question?.page.surveyId ?? null;
    }

    if (params.responseId) {
      const response = await this.prisma.response.findUnique({
        where: { id: params.responseId },
        select: { surveyId: true },
      });
      return response?.surveyId ?? null;
    }

    if (query?.surveyId) {
      return query.surveyId;
    }

    return null;
  }
}
