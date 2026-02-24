import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ResponseStatus, SurveyStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { SaveAnswersDtoRequest } from '../dto/request/save-answers.dto.request';

@Injectable()
export class ResponseService {
  constructor(private readonly prisma: PrismaService) {}

  async startResponse(surveyId: string, userId?: string, anonymousId?: string) {
    const survey = await this.prisma.survey.findFirst({
      where: {
        id: surveyId,
        deletedAt: null,
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    if (survey.status !== SurveyStatus.PUBLISHED) {
      throw new BadRequestException('Survey is not published');
    }

    const now = new Date();
    if (survey.startDate && now < survey.startDate) {
      throw new BadRequestException('Survey has not started yet');
    }
    if (survey.endDate && now > survey.endDate) {
      throw new BadRequestException('Survey has ended');
    }

    if (userId) {
      const inProgress = await this.prisma.response.findFirst({
        where: {
          surveyId,
          userId,
          status: ResponseStatus.PARTIAL,
        },
        select: { id: true },
      });

      if (inProgress) {
        return {
          responseId: inProgress.id,
        };
      }

      const completed = await this.prisma.response.findFirst({
        where: {
          surveyId,
          userId,
          status: ResponseStatus.COMPLETED,
        },
      });

      if (completed) {
        throw new ForbiddenException('Response already submitted');
      }
    }

    const response = await this.prisma.response.create({
      data: {
        surveyId,
        userId: userId ?? null,
        anonymousId: userId ? null : anonymousId,
        status: ResponseStatus.PARTIAL,
      },
    });

    return {
      responseId: response.id,
    };
  }

  async saveAnswers(responseId: string, dto: SaveAnswersDtoRequest) {
    const response = await this.prisma.response.findUnique({
      where: { id: responseId },
      include: {
        survey: true,
      },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (response.status !== ResponseStatus.PARTIAL) {
      throw new BadRequestException('Cannot update answers for submitted response');
    }

    const questionIds = dto.answers.map((answer) => answer.questionId);
    const matchedQuestions = await this.prisma.question.findMany({
      where: {
        id: {
          in: questionIds,
        },
        page: {
          surveyId: response.surveyId,
        },
      },
      select: { id: true },
    });

    if (matchedQuestions.length !== questionIds.length) {
      throw new BadRequestException('One or more questions do not belong to survey');
    }

    await this.prisma.$transaction(
      dto.answers.map((answer) =>
        this.prisma.answer.upsert({
          where: {
            responseId_questionId: {
              responseId,
              questionId: answer.questionId,
            },
          },
          update: {
            value: answer.value as Prisma.InputJsonValue,
          },
          create: {
            responseId,
            questionId: answer.questionId,
            value: answer.value as Prisma.InputJsonValue,
          },
        }),
      ),
    );
  }

  async submitResponse(responseId: string) {
    const response = await this.prisma.response.findUnique({
      where: { id: responseId },
      include: {
        survey: true,
      },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (response.status !== ResponseStatus.PARTIAL) {
      throw new BadRequestException('Only in-progress responses can be submitted');
    }

    if (response.survey.status !== SurveyStatus.PUBLISHED) {
      throw new BadRequestException('Survey is not published');
    }

    const completionTime = Math.max(
      0,
      Math.floor((Date.now() - response.createdAt.getTime()) / 1000),
    );

    await this.prisma.response.update({
      where: { id: responseId },
      data: {
        status: ResponseStatus.COMPLETED,
        submittedAt: new Date(),
        completionTime,
      },
    });
  }

  async reopenResponse(responseId: string, userId: string) {
    const response = await this.prisma.response.findUnique({
      where: { id: responseId },
      include: {
        survey: true,
      },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (response.survey.status !== SurveyStatus.PUBLISHED) {
      throw new BadRequestException('Survey is not published');
    }

    if (!response.userId || response.userId !== userId) {
      throw new ForbiddenException('Only response owner can reopen');
    }

    await this.prisma.response.update({
      where: { id: responseId },
      data: {
        status: ResponseStatus.PARTIAL,
        submittedAt: null,
      },
    });
  }

  async deleteResponse(responseId: string, userId: string) {
    const response = await this.prisma.response.findUnique({
      where: { id: responseId },
      include: {
        survey: {
          include: {
            members: {
              where: {
                userId,
                removedAt: null,
              },
            },
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    const membership = response.survey.members[0];
    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException('Only survey owner can delete responses');
    }

    await this.prisma.response.delete({
      where: { id: responseId },
    });
  }
}
