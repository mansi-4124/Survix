import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationRole,
  Prisma,
  ResponseStatus,
  SurveyRole,
  SurveyStatus,
  SurveyVisibility,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import { EmailSenderService } from 'src/common/email/email.service';
import { buildSurvixEmailHtml } from 'src/common/email/email-template';
import { TokenPayload } from 'src/modules/auth/domain/types/token-payload.type';
import { CreateQuestionDtoRequest } from '../dto/request/create-question.dto.request';
import { CreateSurveyDtoRequest } from '../dto/request/create-survey.dto.request';
import { MoveQuestionDtoRequest } from '../dto/request/move-question.dto.request';
import { ReorderQuestionsDtoRequest } from '../dto/request/reorder-questions.dto.request';
import { CreateSurveyPageDtoRequest } from '../dto/request/create-survey-page.dto.request';
import { UpdateQuestionDtoRequest } from '../dto/request/update-question.dto.request';
import { UpdateSurveyPageDtoRequest } from '../dto/request/update-survey-page.dto.request';
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
    const startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    this.assertValidSchedule(startsAt, endsAt);

    let creatorOrgRole: OrganizationRole | null = null;
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

      creatorOrgRole = orgMembership.role;
      if (
        orgMembership.role !== OrganizationRole.OWNER &&
        orgMembership.role !== OrganizationRole.ADMIN
      ) {
        throw new ForbiddenException(
          'Only organization owner/admin can create surveys',
        );
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const organizationOwners = dto.organizationId
        ? await tx.organizationMember.findMany({
            where: {
              organizationId: dto.organizationId,
              status: 'ACTIVE',
              role: OrganizationRole.OWNER,
            },
            select: {
              userId: true,
            },
          })
        : [];

      const survey = await tx.survey.create({
        data: {
          title: dto.title,
          description: dto.description,
          organizationId: dto.organizationId,
          ownerUserId: dto.organizationId
            ? (organizationOwners[0]?.userId ?? userId)
            : userId,
          status: SurveyStatus.DRAFT,
          visibility: dto.visibility,
          allowAnonymous: dto.allowAnonymous,
          randomizeQuestions: dto.randomizeQuestions ?? false,
          startDate: startsAt,
          endDate: endsAt,
          deletedAt: null,
        },
      });

      await tx.surveyPage.create({
        data: {
          surveyId: survey.id,
          createdBy: userId,
          title: 'Page 1',
          description: null,
          order: 1,
        },
      });

      await tx.surveyMember.create({
        data: {
          surveyId: survey.id,
          userId,
          role:
            dto.organizationId && creatorOrgRole === OrganizationRole.ADMIN
              ? SurveyRole.ADMIN
              : SurveyRole.OWNER,
        },
      });

      if (dto.organizationId) {
        const ownerUserIds = organizationOwners.map((owner) => owner.userId);
        await Promise.all(
          ownerUserIds
            .filter((ownerUserId) => ownerUserId !== userId)
            .map((ownerUserId) =>
              tx.surveyMember.upsert({
                where: {
                  surveyId_userId: {
                    surveyId: survey.id,
                    userId: ownerUserId,
                  },
                },
                update: {
                  role: SurveyRole.OWNER,
                  removedAt: null,
                },
                create: {
                  surveyId: survey.id,
                  userId: ownerUserId,
                  role: SurveyRole.OWNER,
                },
              }),
            ),
        );
      }

      return survey;
    });

    return {
      id: created.id,
      status: created.status,
      publicLink: randomUUID(),
    };
  }

  async getMySurveys(userId: string) {
    const memberships = await this.prisma.surveyMember.findMany({
      where: {
        userId,
        removedAt: null,
        survey: {
          OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
        },
      },
      include: {
        survey: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    const ownedWithoutMembership = await this.prisma.survey.findMany({
      where: {
        ownerUserId: userId,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const bySurveyId = new Map<
      string,
      {
        id: string;
        title: string;
        description: string | null;
        status: SurveyStatus;
        visibility: SurveyVisibility;
        allowAnonymous: boolean;
        randomizeQuestions: boolean;
        organizationId: string | null;
        startsAt: Date | null;
        endsAt: Date | null;
        publishedAt: Date | null;
        role: SurveyRole;
        createdAt: Date;
        updatedAt: Date;
      }
    >();

    for (const membership of memberships) {
      bySurveyId.set(membership.survey.id, {
        id: membership.survey.id,
        title: membership.survey.title,
        description: membership.survey.description,
        status: membership.survey.status,
        visibility: membership.survey.visibility,
        allowAnonymous: membership.survey.allowAnonymous,
        randomizeQuestions: membership.survey.randomizeQuestions,
        organizationId: membership.survey.organizationId,
        startsAt: membership.survey.startDate,
        endsAt: membership.survey.endDate,
        publishedAt: membership.survey.publishedAt,
        role: membership.role,
        createdAt: membership.survey.createdAt,
        updatedAt: membership.survey.updatedAt,
      });
    }

    for (const survey of ownedWithoutMembership) {
      if (bySurveyId.has(survey.id)) {
        continue;
      }
      bySurveyId.set(survey.id, {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        visibility: survey.visibility,
        allowAnonymous: survey.allowAnonymous,
        randomizeQuestions: survey.randomizeQuestions,
        organizationId: survey.organizationId,
        startsAt: survey.startDate,
        endsAt: survey.endDate,
        publishedAt: survey.publishedAt,
        role: SurveyRole.OWNER,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
      });
    }

    return [...bySurveyId.values()].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  async updateSurvey(surveyId: string, dto: UpdateSurveyDtoRequest) {
    const existing = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      select: { startDate: true, endDate: true },
    });

    if (!existing) {
      throw new NotFoundException('Survey not found');
    }

    const startsAt =
      dto.startsAt !== undefined
        ? dto.startsAt
          ? new Date(dto.startsAt)
          : null
        : existing.startDate;
    const endsAt =
      dto.endsAt !== undefined
        ? dto.endsAt
          ? new Date(dto.endsAt)
          : null
        : existing.endDate;
    this.assertValidSchedule(startsAt, endsAt);

    const updated = await this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        title: dto.title,
        description: dto.description,
        visibility: dto.visibility,
        allowAnonymous: dto.allowAnonymous,
        randomizeQuestions: dto.randomizeQuestions,
        startDate: dto.startsAt !== undefined ? startsAt : undefined,
        endDate: dto.endsAt !== undefined ? endsAt : undefined,
        revision: { increment: 1 },
      },
      select: { revision: true },
    });

    return updated;
  }

  async publishSurvey(surveyId: string, actorUserId: string) {
    const survey = await this.prisma.survey.findFirst({
      where: {
        id: surveyId,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
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

    const actorMembership =
      survey.members.find((m) => m.userId === actorUserId) ?? null;
    const canManage = await this.canManageSurvey(
      survey,
      actorMembership,
      actorUserId,
    );
    if (!canManage) {
      throw new ForbiddenException(
        'Only survey owner or organization owner/admin can publish',
      );
    }

    await this.assertSurveyPublishable(survey.id, survey.pages.length);

    const now = new Date();
    const startDate = survey.startDate ?? null;
    const shouldPublishNow = !startDate || startDate <= now;

    if (!shouldPublishNow) {
      await this.prisma.survey.update({
        where: { id: surveyId },
        data: {
          status: SurveyStatus.DRAFT,
          publishedAt: now,
        },
      });

      return {
        status: SurveyStatus.DRAFT,
      };
    }

    await this.publishSurveyNow(surveyId, now);

    return {
      status: SurveyStatus.PUBLISHED,
    };
  }

  async publishScheduledSurvey(surveyId: string): Promise<boolean> {
    const survey = await this.prisma.survey.findFirst({
      where: {
        id: surveyId,
        status: SurveyStatus.DRAFT,
        publishedAt: { not: null },
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
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
      return false;
    }

    const now = new Date();
    if (survey.startDate && survey.startDate > now) {
      return false;
    }

    await this.assertSurveyPublishable(survey.id, survey.pages.length);
    await this.publishSurveyNow(survey.id, now);
    return true;
  }

  async closeSurvey(surveyId: string, actorUserId: string) {
    await this.assertManageAccess(surveyId, actorUserId);

    return this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        status: SurveyStatus.CLOSED,
        endDate: new Date(),
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

    const canDelete = await this.canManageSurvey(
      survey,
      surveyMembership ?? null,
      actorUserId,
    );

    if (!canDelete) {
      throw new ForbiddenException(
        'Only survey owner or organization owner/admin can delete survey',
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
      where: {
        id: surveyId,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
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
          deletedAt: null,
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
    const normalizedSearch = search?.trim();
    const where: Prisma.SurveyWhereInput = {
      visibility: SurveyVisibility.PUBLIC,
      status: SurveyStatus.PUBLISHED,
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      ...(normalizedSearch
        ? {
            OR: [
              {
                title: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(user?.sub
        ? {}
        : {
            allowAnonymous: true,
          }),
    };

    const surveys = await this.prisma.survey.findMany({
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

    if (!user?.sub) {
      return surveys.map((survey) => ({
        ...survey,
        hasResponded: false,
      }));
    }

    const surveyIds = surveys.map((survey) => survey.id);
    if (surveyIds.length === 0) {
      return [];
    }

    const completedResponses = await this.prisma.response.findMany({
      where: {
        surveyId: { in: surveyIds },
        userId: user.sub,
        status: ResponseStatus.COMPLETED,
      },
      select: {
        surveyId: true,
      },
    });
    const completedSurveyIds = new Set(
      completedResponses.map((response) => response.surveyId),
    );

    return surveys.map((survey) => ({
      ...survey,
      hasResponded: completedSurveyIds.has(survey.id),
    }));
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
    await this.assertManageAccess(surveyId, actorUserId);

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

  async createPage(
    surveyId: string,
    actorUserId: string,
    dto: CreateSurveyPageDtoRequest,
  ) {
    await this.assertManageAccess(surveyId, actorUserId);

    const maxPage = await this.prisma.surveyPage.findFirst({
      where: { surveyId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const page = await this.prisma.surveyPage.create({
      data: {
        surveyId,
        createdBy: actorUserId,
        title: dto.title,
        description: dto.description ?? null,
        order: (maxPage?.order ?? 0) + 1,
      },
    });

    await this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        revision: { increment: 1 },
      },
    });

    return {
      id: page.id,
      order: page.order,
    };
  }

  async updatePage(pageId: string, dto: UpdateSurveyPageDtoRequest) {
    const page = await this.prisma.surveyPage.update({
      where: { id: pageId },
      data: {
        title: dto.title,
        description: dto.description,
      },
    });

    await this.prisma.survey.update({
      where: { id: page.surveyId },
      data: {
        revision: { increment: 1 },
      },
    });

    return page;
  }

  async deletePage(pageId: string) {
    const page = await this.prisma.surveyPage.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        surveyId: true,
        order: true,
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const totalPages = await this.prisma.surveyPage.count({
      where: { surveyId: page.surveyId },
    });

    if (totalPages <= 1) {
      throw new BadRequestException('Survey must contain at least one page');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.surveyPage.delete({
        where: { id: page.id },
      });

      const followingPages = await tx.surveyPage.findMany({
        where: {
          surveyId: page.surveyId,
          order: {
            gt: page.order,
          },
        },
        orderBy: {
          order: 'asc',
        },
      });

      await Promise.all(
        followingPages.map((item) =>
          tx.surveyPage.update({
            where: { id: item.id },
            data: { order: item.order - 1 },
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
  }

  async removeMember(
    surveyId: string,
    actorUserId: string,
    targetUserId: string,
  ) {
    await this.assertManageAccess(surveyId, actorUserId);

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

  async listMembers(surveyId: string, actorUserId: string) {
    await this.assertMemberAccess(surveyId, actorUserId);

    const members = await this.prisma.surveyMember.findMany({
      where: {
        surveyId,
        removedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'asc',
      },
    });

    return members.map((member) => ({
      userId: member.userId,
      role: member.role,
      assignedAt: member.assignedAt,
      removedAt: member.removedAt,
      user: member.user,
    }));
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
    const question = await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        text: dto.title,
        description: dto.description,
        isRequired: dto.isRequired,
        type: dto.type,
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

  private async assertManageAccess(
    surveyId: string,
    userId: string,
  ): Promise<void> {
    const survey = await this.prisma.survey.findUnique({
      where: {
        id: surveyId,
      },
    });

    if (!survey || survey.deletedAt) {
      throw new NotFoundException('Survey not found');
    }

    const membership = await this.prisma.surveyMember.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId,
        },
      },
    });

    if (await this.canManageSurvey(survey, membership, userId)) {
      return;
    }

    throw new ForbiddenException(
      'Only survey owner or organization owner/admin can perform this action',
    );
  }

  private async assertMemberAccess(
    surveyId: string,
    userId: string,
  ): Promise<void> {
    const survey = await this.prisma.survey.findFirst({
      where: {
        id: surveyId,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      select: {
        id: true,
        ownerUserId: true,
        organizationId: true,
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    if (survey.ownerUserId === userId) {
      return;
    }

    const membership = await this.prisma.surveyMember.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId,
        },
      },
    });

    if (membership && !membership.removedAt) {
      return;
    }

    if (survey.organizationId) {
      const organizationMembership =
        await this.prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: survey.organizationId,
              userId,
            },
          },
        });

      if (
        organizationMembership &&
        organizationMembership.status === 'ACTIVE' &&
        (organizationMembership.role === OrganizationRole.OWNER ||
          organizationMembership.role === OrganizationRole.ADMIN)
      ) {
        return;
      }
    }

    throw new ForbiddenException('Survey access denied');
  }

  private async canManageSurvey(
    survey: { organizationId?: string | null },
    surveyMembership: {
      role: SurveyRole;
      removedAt: Date | null;
    } | null,
    userId: string,
  ): Promise<boolean> {
    if (
      surveyMembership &&
      !surveyMembership.removedAt &&
      (surveyMembership.role === SurveyRole.OWNER ||
        surveyMembership.role === SurveyRole.ADMIN)
    ) {
      return true;
    }

    if (!survey.organizationId) {
      return false;
    }

    const orgMembership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: survey.organizationId,
          userId,
        },
      },
    });

    return (
      !!orgMembership &&
      orgMembership.status === 'ACTIVE' &&
      (orgMembership.role === OrganizationRole.OWNER ||
        orgMembership.role === OrganizationRole.ADMIN)
    );
  }

  private async assertSurveyPublishable(
    surveyId: string,
    pageCount: number,
  ): Promise<void> {
    if (pageCount === 0) {
      throw new BadRequestException(
        'Survey must include at least one page and one question',
      );
    }

    const questionCount = await this.prisma.question.count({
      where: {
        page: {
          surveyId,
        },
      },
    });

    if (questionCount === 0) {
      throw new BadRequestException(
        'Survey must include at least one page and one question',
      );
    }
  }

  private async publishSurveyNow(
    surveyId: string,
    publishedAt: Date,
  ): Promise<void> {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        members: {
          where: { removedAt: null },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const updated = await this.prisma.survey.updateMany({
      where: {
        id: surveyId,
        status: SurveyStatus.DRAFT,
      },
      data: {
        status: SurveyStatus.PUBLISHED,
        publishedAt: survey.publishedAt ?? publishedAt,
        startDate: survey.startDate ?? publishedAt,
      },
    });

    if (updated.count === 0) {
      return;
    }

    if (survey.visibility === SurveyVisibility.PRIVATE) {
      await this.sendPrivateSurveyAccessEmails(survey.id, survey.members);
    }
  }

  private async sendPrivateSurveyAccessEmails(
    surveyId: string,
    members: Array<{ userId: string }>,
  ): Promise<void> {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      select: { endDate: true },
    });

    const endDate = survey?.endDate ?? null;
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: members.map((m) => m.userId),
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
          surveyId,
          user.id,
          endDate,
        );

        const accessLink = `${process.env.FRONTEND_URL ?? ''}/respond/${surveyId}?token=${token}`;

        await this.emailSender.sendMail({
          to: user.email,
          subject: 'Private survey access',
          text: `You have been invited to a private survey: ${accessLink}`,
          html: buildSurvixEmailHtml({
            heading: 'Private Survey Access',
            body: 'You have been invited to respond to a private survey.',
            actionLabel: 'Open Survey',
            actionUrl: accessLink,
          }),
        });
      }),
    );
  }

  private assertValidSchedule(
    startsAt: Date | null,
    endsAt: Date | null,
  ): void {
    const now = new Date();

    if (startsAt && Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Invalid start date');
    }

    if (endsAt && Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid end date');
    }

    if (startsAt && startsAt < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    if (endsAt && endsAt < now) {
      throw new BadRequestException('End date cannot be in the past');
    }

    if (startsAt && endsAt && endsAt < startsAt) {
      throw new BadRequestException('End date must be after start date');
    }
  }
}
