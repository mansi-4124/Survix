import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrganizationMemberStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { TokenPayload } from 'src/modules/auth/domain/types/token-payload.type';

type PollGuardRequest = Request & {
  user?: TokenPayload;
};

@Injectable()
export class PollOrganizationMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PollGuardRequest>();
    const user = request.user;

    if (!user?.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    const organizationId = await this.resolveOrganizationId(request);
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.sub,
        },
      },
    });

    if (!membership || membership.status !== OrganizationMemberStatus.ACTIVE) {
      throw new ForbiddenException(
        'Only active organization members can manage polls',
      );
    }

    request.organizationMembership = membership;
    return true;
  }

  private async resolveOrganizationId(
    request: PollGuardRequest,
  ): Promise<string | null> {
    const body = request.body as { organizationId?: unknown } | undefined;
    const fromBody = body?.organizationId;
    if (typeof fromBody === 'string' && fromBody.length > 0) {
      return fromBody;
    }

    if (request.poll?.organizationId) {
      return request.poll.organizationId;
    }

    const pollIdParam = request.params?.pollId;
    const pollId =
      typeof pollIdParam === 'string' && pollIdParam.length > 0
        ? pollIdParam
        : null;

    if (!pollId) {
      return null;
    }

    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true, organizationId: true },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    request.poll = { id: poll.id, organizationId: poll.organizationId };
    return poll.organizationId;
  }
}
