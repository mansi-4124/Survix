import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PollStatus,
  SurveyStatus,
  SurveyVisibility,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PublicUserProfileDtoResponse } from '../dto/response/public-user-profile.dto.response';
import { CloudinaryService } from 'src/modules/media/services/cloudinary.service';
import type { UploadedFileType } from 'src/common/types/uploaded-file.type';
import { UserResponseDto } from '../dto/response/user-response.dto.response';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getPublicProfile(usernameOrId: string): Promise<PublicUserProfileDtoResponse> {
    const trimmed = usernameOrId?.trim();
    if (!trimmed) {
      throw new BadRequestException('Username is required');
    }
    const isObjectId = Boolean(trimmed && /^[0-9a-fA-F]{24}$/.test(trimmed));
    const user = await this.prisma.user.findFirst({
      where: {
        status: UserStatus.ACTIVE,
        ...(isObjectId ? { id: trimmed } : { username: trimmed }),
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const publicSurveyWhere = {
      ownerUserId: user.id,
      visibility: SurveyVisibility.PUBLIC,
      status: SurveyStatus.PUBLISHED,
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    };

    const publicPollWhere = {
      createdBy: user.id,
      status: { in: [PollStatus.LIVE, PollStatus.CLOSED] },
      allowAnonymous: true,
    };

    const [surveys, polls, surveyCount, pollCount] =
      await this.prisma.$transaction([
        this.prisma.survey.findMany({
          where: publicSurveyWhere,
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
          where: publicPollWhere,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { votes: true } } },
        }),
        this.prisma.survey.count({ where: publicSurveyWhere }),
        this.prisma.poll.count({ where: publicPollWhere }),
      ]);

    const now = Date.now();
    const totalVotes = polls.reduce((sum, poll) => sum + poll._count.votes, 0);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
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
      counts: {
        surveys: surveyCount,
        polls: pollCount,
        totalVotes,
      },
    };
  }

  async updateAvatar(
    userId: string,
    file: UploadedFileType,
  ): Promise<UserResponseDto> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Avatar file is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Avatar must be an image');
    }

    const uploaded = await this.cloudinaryService.uploadFile(file, {
      folder: 'users',
      resourceType: 'image',
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: uploaded.url },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
      },
    });

    return updated;
  }
}
