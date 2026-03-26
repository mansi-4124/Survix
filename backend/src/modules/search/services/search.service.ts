import { Injectable } from '@nestjs/common';
import {
  OrganizationStatus,
  OrganizationVisibility,
  PollStatus,
  SurveyStatus,
  SurveyVisibility,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { GlobalSearchDtoResponse } from '../dto/response/global-search.dto.response';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, limit = 6): Promise<GlobalSearchDtoResponse> {
    const normalized = query.trim();
    if (normalized.length < 2) {
      return {
        surveys: [],
        polls: [],
        organizations: [],
        users: [],
        counts: { surveys: 0, polls: 0, organizations: 0, users: 0 },
      };
    }

    const textFilter = {
      contains: normalized,
      mode: 'insensitive' as const,
    };

    const notDeleted = { OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] };

    const surveyWhere = {
      visibility: SurveyVisibility.PUBLIC,
      status: SurveyStatus.PUBLISHED,
      AND: [notDeleted, { OR: [{ title: textFilter }, { description: textFilter }] }],
    };

    const publicOrgWhere = {
      visibility: OrganizationVisibility.PUBLIC,
      status: OrganizationStatus.ACTIVE,
      AND: [notDeleted],
    };

    const orgWhere = {
      visibility: OrganizationVisibility.PUBLIC,
      status: OrganizationStatus.ACTIVE,
      AND: [
        notDeleted,
        { OR: [{ name: textFilter }, { slug: textFilter }, { description: textFilter }] },
      ],
    };

    const pollWhere = {
      status: { in: [PollStatus.LIVE, PollStatus.CLOSED] },
      allowAnonymous: true,
      OR: [{ title: textFilter }, { description: textFilter }],
      organization: publicOrgWhere,
    };

    const userWhere = {
      status: UserStatus.ACTIVE,
      OR: [{ username: textFilter }, { email: textFilter }, { name: textFilter }],
    };

    const [
      surveys,
      polls,
      organizations,
      users,
      surveyCount,
      pollCount,
      organizationCount,
      userCount,
    ] = await this.prisma.$transaction([
      this.prisma.survey.findMany({
        where: surveyWhere,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          visibility: true,
          status: true,
          allowAnonymous: true,
          randomizeQuestions: true,
          createdAt: true,
        },
      }),
      this.prisma.poll.findMany({
        where: pollWhere,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { votes: true } } },
      }),
      this.prisma.organization.findMany({
        where: orgWhere,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          visibility: true,
          accountType: true,
          logoUrl: true,
        },
      }),
      this.prisma.user.findMany({
        where: userWhere,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
        },
      }),
      this.prisma.survey.count({ where: surveyWhere }),
      this.prisma.poll.count({ where: pollWhere }),
      this.prisma.organization.count({ where: orgWhere }),
      this.prisma.user.count({ where: userWhere }),
    ]);

    const now = Date.now();

    return {
      surveys: surveys.map((survey) => ({
        ...survey,
      })),
      polls: polls.map((poll) => ({
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        isActive: poll.status === PollStatus.LIVE && poll.expiresAt.getTime() > now,
        expiresAt: poll.expiresAt,
        totalVotes: poll._count.votes,
      })),
      organizations,
      users,
      counts: {
        surveys: surveyCount,
        polls: pollCount,
        organizations: organizationCount,
        users: userCount,
      },
    };
  }
}
