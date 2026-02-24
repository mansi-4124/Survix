import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SurveyRole, SurveyStatus, SurveyVisibility } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import { EmailSenderService } from 'src/common/email/email.service';
import { TokenPayload } from 'src/modules/auth/domain/types/token-payload.type';
import { CreateQuestionDtoRequest } from '../dto/request/create-question.dto.request';
import { CreateSurveyDtoRequest } from '../dto/request/create-survey.dto.request';
import { MoveQuestionDtoRequest } from '../dto/request/move-question.dto.request';
import { ReorderQuestionsDtoRequest } from '../dto/request/reorder-questions.dto.request';
import { UpdateQuestionDtoRequest } from '../dto/request/update-question.dto.request';
import { UpdateSurveyDtoRequest } from '../dto/request/update-survey.dto.request';
import { SurveyQuestionDtoResponse } from '../dto/response/survey-question.dto.response';
import { SurveyAccessTokenService } from './survey-access-token.service';

@Injectable()
export class SurveyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly surveyAccessTokenService: SurveyAccessTokenService,
    private readonly emailSender: EmailSenderService,
  ) {}

  async createSurvey(userId: string, dto: CreateSurveyDtoRequest) {
    if (dto.organizationId) {
      const orgMembership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: dto.organizationId,
            userId,
          },
        },
      });

      if (!orgMembership || orgMembership.status !== 'ACTIVE') {
        throw new ForbiddenException(
          'User is not an active member of the organization',
        );
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const survey = await tx.survey.create({
        data: {
          title: dto.title,
          description: dto.description,
          organizationId: dto.organizationId,
          ownerUserId: dto.organizationId ? null : userId,
          status: SurveyStatus.DRAFT,
          visibility: dto.visibility,
          allowAnonymous: dto.allowAnonymous,
          randomizeQuestions: dto.randomizeQuestions ?? false,
          startDate: dto.startsAt ? new Date(dto.startsAt) : null,
          endDate: dto.endsAt ? new Date(dto.endsAt) : null,
        },
      });

      await tx.surveyMember.create({
        data: {
          surveyId: survey.id,
          userId,
          role: SurveyRole.OWNER,
        },
      });

      return survey;
    });

    return {
      id: created.id,
      status: created.status,
      publicLink: randomUUID(),
    };
  }

  async updateSurvey(surveyId: string, dto: UpdateSurveyDtoRequest) {
    const updated = await this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        title: dto.title,
        description: dto.description,
        visibility: dto.visibility,
        allowAnonymous: dto.allowAnonymous,
        randomizeQuestions: dto.randomizeQuestions,
        startDate: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endDate: dto.endsAt ? new Date(dto.endsAt) : undefined,
        revision: { increment: 1 },
      },
      select: { revision: true },
    });

    return updated;
  }

  async publishSurvey(surveyId: string, actorUserId: string) {
    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId, deletedAt: null },
      include: {
        pages: true,
        members: {
          where: {
            removedAt: null,
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const actorMembership = survey.members.find((m) => m.userId === actorUserId);
    if (!actorMembership || actorMembership.role !== SurveyRole.OWNER) {
      throw new ForbiddenException('Only survey owner can publish');
    }

    if (survey.pages.length === 0) {
      throw new BadRequestException(
        'Survey must include at least one page and one question',
      );
    }

    const questionCount = await this.prisma.question.count({
      where: {
        page: {
          surveyId: survey.id,
        },
      },
    });

    if (questionCount === 0) {
      throw new BadRequestException(
        'Survey must include at least one page and one question',
      );
    }

    await this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        status: SurveyStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    if (survey.visibility === SurveyVisibility.PRIVATE) {
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            in: survey.members.map((m) => m.userId),
          },
        },
        select: {
          id: true,
          email: true,
        },
      });

      await Promise.all(
        users.map(async (user) => {
          const token = await this.surveyAccessTokenService.createToken(
            survey.id,
            user.id,
          );

          const accessLink = `${process.env.FRONTEND_URL ?? ''}/survey/${survey.id}?token=${token}`;

          await this.emailSender.sendMail({
            to: user.email,
            subject: 'Private survey access',
            text: `You have been invited to a private survey: ${accessLink}`,
          });
        }),
      );
    }

    return {
      status: SurveyStatus.PUBLISHED,
    };
  }

  async closeSurvey(surveyId: string, actorUserId: string) {
    await this.assertOwner(surveyId, actorUserId);

    return this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        status: SurveyStatus.CLOSED,
      },
      select: {
        status: true,
      },
    });
  }

  async softDeleteSurvey(surveyId: string, actorUserId: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        organization: true,
      },
    });

    if (!survey || survey.deletedAt) {
      throw new NotFoundException('Survey not found');
    }

    const surveyMembership = await this.prisma.surveyMember.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId: actorUserId,
        },
      },
    });

    let canDelete = surveyMembership?.role === SurveyRole.OWNER;

    if (!canDelete && survey.organizationId) {
      const orgMembership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: survey.organizationId,
            userId: actorUserId,
          },
        },
      });

      canDelete = orgMembership?.role === 'OWNER';
    }

    if (!canDelete) {
      throw new ForbiddenException(
        'Only survey owner or organization owner can delete survey',
      );
    }

    await this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async duplicateSurvey(surveyId: string, actorUserId: string) {
    await this.assertMemberAccess(surveyId, actorUserId);

    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId, deletedAt: null },
      include: {
        pages: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const duplicated = await this.prisma.$transaction(async (tx) => {
      const newSurvey = await tx.survey.create({
        data: {
          title: `${survey.title} (Copy)`,
          description: survey.description,
          organizationId: survey.organizationId,
          ownerUserId: actorUserId,
          status: SurveyStatus.DRAFT,
          visibility: survey.visibility,
          allowAnonymous: survey.allowAnonymous,
          randomizeQuestions: survey.randomizeQuestions,
          startDate: survey.startDate,
          endDate: survey.endDate,
        },
      });

      await tx.surveyMember.create({
        data: {
          surveyId: newSurvey.id,
          userId: actorUserId,
          role: SurveyRole.OWNER,
        },
      });

      for (const page of survey.pages) {
        const newPage = await tx.surveyPage.create({
          data: {
            surveyId: newSurvey.id,
            title: page.title,
            description: page.description,
            order: page.order,
            createdBy: actorUserId,
          },
        });

        for (const question of page.questions) {
          await tx.question.create({
            data: {
              pageId: newPage.id,
              text: question.text,
              description: question.description,
              type: question.type,
              isRequired: question.isRequired,
              randomizeOptions: question.randomizeOptions,
              order: question.order,
              settings: question.settings as Prisma.InputJsonValue,
              mediaAssetId: question.mediaAssetId,
              createdBy: actorUserId,
            },
          });
        }
      }

      return newSurvey;
    });

    return {
      newSurveyId: duplicated.id,
    };
  }

  async searchPublicSurveys(search?: string, user?: TokenPayload) {
    const where: Prisma.SurveyWhereInput = {
      visibility: SurveyVisibility.PUBLIC,
      status: SurveyStatus.PUBLISHED,
      deletedAt: null,
      ...(search
        ? {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(user?.sub
        ? {}
        : {
            allowAnonymous: true,
          }),
    };

    return this.prisma.survey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        visibility: true,
        allowAnonymous: true,
        randomizeQuestions: true,
        createdAt: true,
      },
    });
  }

  async getSurveyForView(surveyId: string) {
    return this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        pages: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  async addOrUpdateMember(
    surveyId: string,
    actorUserId: string,
    targetUserId: string,
    role: SurveyRole,
  ) {
    await this.assertOwner(surveyId, actorUserId);

    return this.prisma.surveyMember.upsert({
      where: {
        surveyId_userId: {
          surveyId,
          userId: targetUserId,
        },
      },
      update: {
        role,
        removedAt: null,
        assignedBy: actorUserId,
      },
      create: {
        surveyId,
        userId: targetUserId,
        role,
        assignedBy: actorUserId,
      },
    });
  }

  async removeMember(surveyId: string, actorUserId: string, targetUserId: string) {
    await this.assertOwner(surveyId, actorUserId);

    const target = await this.prisma.surveyMember.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId: targetUserId,
        },
      },
    });

    if (!target) {
      throw new NotFoundException('Member not found');
    }

    if (target.role === SurveyRole.OWNER) {
      throw new BadRequestException('Cannot remove survey owner');
    }

    await this.prisma.surveyMember.update({
      where: {
        surveyId_userId: {
          surveyId,
          userId: targetUserId,
        },
      },
      data: {
        removedAt: new Date(),
      },
    });
  }

  async createQuestion(
    pageId: string,
    actorUserId: string,
    dto: CreateQuestionDtoRequest,
  ) {
    const maxOrderQuestion = await this.prisma.question.findFirst({
      where: { pageId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = (maxOrderQuestion?.order ?? 0) + 1;

    const question = await this.prisma.question.create({
      data: {
        pageId,
        text: dto.title,
        description: dto.description,
        type: dto.type,
        isRequired: dto.isRequired,
        randomizeOptions: false,
        order,
        settings: (dto.settings ?? {}) as Prisma.InputJsonValue,
        createdBy: actorUserId,
      },
    });

    const page = await this.prisma.surveyPage.findUnique({
      where: { id: pageId },
      select: { surveyId: true },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    await this.prisma.survey.update({
      where: { id: page.surveyId },
      data: {
        revision: {
          increment: 1,
        },
      },
    });

    return {
      id: question.id,
      order: question.order,
    };
  }

  async updateQuestion(questionId: string, dto: UpdateQuestionDtoRequest) {
    if ((dto as { type?: string }).type) {
      throw new BadRequestException('Question type cannot be changed');
    }

    const question = await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        text: dto.title,
        description: dto.description,
        isRequired: dto.isRequired,
        settings: dto.settings as Prisma.InputJsonValue,
      },
      include: {
        page: true,
      },
    });

    await this.prisma.survey.update({
      where: { id: question.page.surveyId },
      data: {
        revision: { increment: 1 },
      },
    });

    return question;
  }

  async deleteQuestion(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        page: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.question.delete({
        where: { id: questionId },
      });

      const followingQuestions = await tx.question.findMany({
        where: {
          pageId: question.pageId,
          order: {
            gt: question.order,
          },
        },
        orderBy: {
          order: 'asc',
        },
      });

      await Promise.all(
        followingQuestions.map((item) =>
          tx.question.update({
            where: { id: item.id },
            data: { order: item.order - 1 },
          }),
        ),
      );

      await tx.survey.update({
        where: { id: question.page.surveyId },
        data: {
          revision: { increment: 1 },
        },
      });
    });
  }

  async reorderQuestions(pageId: string, dto: ReorderQuestionsDtoRequest) {
    const questions = await this.prisma.question.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    });

    if (questions.length !== dto.orderedQuestionIds.length) {
      throw new BadRequestException(
        'orderedQuestionIds must include all questions in this page',
      );
    }

    const idSet = new Set(dto.orderedQuestionIds);
    if (idSet.size !== dto.orderedQuestionIds.length) {
      throw new BadRequestException('orderedQuestionIds contains duplicates');
    }

    const existingSet = new Set(questions.map((q) => q.id));
    for (const id of dto.orderedQuestionIds) {
      if (!existingSet.has(id)) {
        throw new BadRequestException(`Question ${id} does not belong to page`);
      }
    }

    const page = await this.prisma.surveyPage.findUnique({
      where: { id: pageId },
      select: { surveyId: true },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        dto.orderedQuestionIds.map((questionId, index) =>
          tx.question.update({
            where: { id: questionId },
            data: { order: index + 1 },
          }),
        ),
      );

      await tx.survey.update({
        where: { id: page.surveyId },
        data: {
          revision: { increment: 1 },
        },
      });
    });

    return { message: 'Reordered successfully' };
  }

  async moveQuestion(
    questionId: string,
    dto: MoveQuestionDtoRequest,
    actorUserId: string,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        page: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const targetPage = await this.prisma.surveyPage.findUnique({
      where: {
        id: dto.targetPageId,
      },
    });

    if (!targetPage) {
      throw new NotFoundException('Target page not found');
    }

    if (targetPage.surveyId !== question.page.surveyId) {
      throw new BadRequestException('Target page must be in the same survey');
    }

    const targetMaxOrder = await this.prisma.question.findFirst({
      where: { pageId: targetPage.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: question.id },
        data: {
          pageId: targetPage.id,
          order: (targetMaxOrder?.order ?? 0) + 1,
          createdBy: actorUserId,
        },
      });

      const sourcePageQuestions = await tx.question.findMany({
        where: {
          pageId: question.pageId,
        },
        orderBy: {
          order: 'asc',
        },
      });

      await Promise.all(
        sourcePageQuestions.map((item, index) =>
          tx.question.update({
            where: {
              id: item.id,
            },
            data: {
              order: index + 1,
            },
          }),
        ),
      );

      await tx.survey.update({
        where: { id: question.page.surveyId },
        data: {
          revision: { increment: 1 },
        },
      });
    });
  }

  async getQuestions(pageId: string): Promise<SurveyQuestionDtoResponse[]> {
    const questions = await this.prisma.question.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    });

    return questions.map((question) => ({
      id: question.id,
      order: question.order,
      text: question.text,
      description: question.description,
      type: question.type,
      isRequired: question.isRequired,
      settings: question.settings as Record<string, unknown> | null,
    }));
  }

  async getSurveyStructure(surveyId: string, randomized = false) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        pages: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    if (!randomized || !survey.randomizeQuestions) {
      return survey;
    }

    const shuffledPages = survey.pages.map((page) => ({
      ...page,
      questions: [...page.questions].sort(() => Math.random() - 0.5),
    }));

    return {
      ...survey,
      pages: shuffledPages,
    };
  }

  private async assertOwner(surveyId: string, userId: string): Promise<void> {
    const membership = await this.prisma.surveyMember.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId,
        },
      },
    });

    if (!membership || membership.removedAt || membership.role !== SurveyRole.OWNER) {
      throw new ForbiddenException('Only survey owner can perform this action');
    }
  }

  private async assertMemberAccess(
    surveyId: string,
    userId: string,
  ): Promise<void> {
    const membership = await this.prisma.surveyMember.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId,
        },
      },
    });

    if (!membership || membership.removedAt) {
      throw new ForbiddenException('Survey access denied');
    }
  }
}
