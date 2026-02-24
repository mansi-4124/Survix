import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SurveyVisibility } from '@prisma/client';
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
        deletedAt: null,
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

    const membership = Array.isArray(survey.members) ? (survey.members[0] ?? null) : null;

    if (survey.visibility === SurveyVisibility.PUBLIC) {
      if (!survey.allowAnonymous && !currentUserId) {
        throw new UnauthorizedException('Authentication required for this survey');
      }

      request.survey = survey;
      request.surveyMembership = membership;
      request.surveyAccessType = SurveyAccessTypeDomain.PUBLIC;
      return true;
    }

    if (membership) {
      request.survey = survey;
      request.surveyMembership = membership;
      request.surveyAccessType = SurveyAccessTypeDomain.MEMBER;
      return true;
    }

    const accessToken = request.query?.token as string | undefined;
    if (!accessToken) {
      throw new ForbiddenException('Access denied for private survey');
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
    request.surveyAccessType = SurveyAccessTypeDomain.TOKEN;

    return true;
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
