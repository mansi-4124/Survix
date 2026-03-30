import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationAccountType,
  OrganizationMemberStatus,
  OrganizationRole,
  OrganizationStatus,
  OrganizationVisibility,
  PollStatus,
  SurveyStatus,
  SurveyVisibility,
} from '@prisma/client';
import { Inject } from '@nestjs/common';
import { ORGANIZATION_TOKENS } from '../organization.tokens';
import type {
  CreateOrganizationInput,
  IOrganizationMemberRepository,
  IOrganizationRepository,
  UpdateOrganizationInput,
} from '../domain/interfaces/organization-repository.interface';
import { OrganizationDomain } from '../domain/types/organization.type';
import { OrganizationMemberDomain } from '../domain/types/organization-member.type';
import { OrganizationRoleDomain } from '../domain/enums/organization-role.enum';
import { EmailSenderService } from 'src/common/email/email.service';
import { buildSurvixEmailHtml } from 'src/common/email/email-template';
import { Redis } from '@upstash/redis';
import { REDIS_CLIENT } from 'src/common/redis/redis.module';
import { randomBytes, createHash } from 'crypto';
import { CreateOrganizationDtoRequest } from '../dto/request/create-organization.dto.request';
import type { UploadedFileType } from 'src/common/types/uploaded-file.type';
import { CloudinaryService } from 'src/modules/media/services/cloudinary.service';
import { PrismaService } from 'prisma/prisma.service';
import { PublicOrganizationDtoResponse } from '../dto/response/public-organization.dto.response';

type InvitePayload = {
  orgId: string;
  email: string;
  role: OrganizationRoleDomain;
};

@Injectable()
export class OrganizationService {
  private readonly inviteTtlSeconds = 60 * 60 * 24 * 7;

  constructor(
    @Inject(ORGANIZATION_TOKENS.ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,

    @Inject(ORGANIZATION_TOKENS.ORGANIZATION_MEMBER_REPOSITORY)
    private readonly memberRepository: IOrganizationMemberRepository,

    private readonly emailSender: EmailSenderService,

    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,

    private readonly cloudinaryService: CloudinaryService,

    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================================
  ORGANIZATION CORE
  =====================================================
  */

  async createOrganization(userId: string, dto: CreateOrganizationDtoRequest) {
    const existingSlug = await this.organizationRepository.findBySlug(dto.slug);
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    const input: CreateOrganizationInput = {
      name: dto.name,
      slug: dto.slug,
      accountType: OrganizationAccountType.ORGANIZATION,
      isPersonal: false,
      visibility: dto.visibility,
      description: dto.description,
      industry: dto.industry,
      size: dto.size,
      websiteUrl: dto.websiteUrl,
      contactEmail: dto.contactEmail,
      ownerId: userId,
    };

    const { organization, membership } = await this.prisma.$transaction(
      async (tx) => {
        const createdOrg = await tx.organization.create({
          data: {
            name: input.name,
            slug: input.slug,
            ownerId: input.ownerId,
            accountType:
              input.accountType ?? OrganizationAccountType.ORGANIZATION,
            isPersonal: input.isPersonal ?? false,
            visibility: input.visibility,
            description: input.description,
            industry: input.industry,
            size: input.size,
            websiteUrl: input.websiteUrl,
            contactEmail: input.contactEmail,
            status: OrganizationStatus.ACTIVE,
          },
        });

        const createdMembership = await tx.organizationMember.create({
          data: {
            organizationId: createdOrg.id,
            userId,
            role: OrganizationRole.OWNER,
            status: OrganizationMemberStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });

        return {
          organization: createdOrg,
          membership: createdMembership,
        };
      },
    );

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        ownerId: organization.ownerId,
        accountType: organization.accountType,
        isPersonal: organization.isPersonal,
        description: organization.description,
        industry: organization.industry,
        size: organization.size,
        websiteUrl: organization.websiteUrl,
        contactEmail: organization.contactEmail,
        visibility: organization.visibility,
        status: organization.status,
        deletedAt: organization.deletedAt,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      membership: {
        id: membership.id,
        organizationId: membership.organizationId,
        userId: membership.userId,
        role: OrganizationRoleDomain.OWNER,
        status: membership.status,
        joinedAt: membership.joinedAt,
        leftAt: membership.leftAt,
        invitedBy: membership.invitedBy,
        removedBy: membership.removedBy,
      },
    };
  }

  async createPersonalWorkspace(userId: string, userEmail: string) {
    const existing = await this.organizationRepository.findByUser(userId);
    const personalWorkspace = existing.find(
      ({ organization }) =>
        organization.accountType === OrganizationAccountType.PERSONAL ||
        organization.isPersonal,
    );

    if (personalWorkspace) {
      return personalWorkspace;
    }

    const emailPrefix = userEmail.split('@')[0] || 'personal';
    const safePrefix = emailPrefix
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${safePrefix || 'personal'}-${Date.now()}`;

    const organization = await this.organizationRepository.create({
      name: 'Personal Workspace',
      slug,
      ownerId: userId,
      accountType: OrganizationAccountType.PERSONAL,
      isPersonal: true,
      visibility: OrganizationVisibility.PRIVATE,
    });

    const membership = await this.memberRepository.createOwnerMembership(
      organization.id,
      userId,
    );

    return { organization, membership };
  }

  async getMyOrganizations(userId: string) {
    return this.organizationRepository.findByUser(userId);
  }

  async getOrganizationDetailsForUser(orgId: string, userId: string) {
    const organization = await this.organizationRepository.findById(orgId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = await this.memberRepository.findMembership(
      orgId,
      userId,
    );
    if (!membership) {
      throw new ForbiddenException('User is not a member of this organization');
    }

    return { organization, membership };
  }

  async getPublicOrganizationProfile(
    slug: string,
    userId?: string,
  ): Promise<PublicOrganizationDtoResponse> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        slug,
        status: OrganizationStatus.ACTIVE,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.visibility !== OrganizationVisibility.PUBLIC) {
      if (!userId) {
        throw new NotFoundException('Organization not found');
      }

      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId,
          },
        },
      });

      if (!membership || membership.status !== OrganizationMemberStatus.ACTIVE) {
        throw new NotFoundException('Organization not found');
      }
    }

    const publicSurveyWhere = {
      organizationId: organization.id,
      visibility: SurveyVisibility.PUBLIC,
      status: SurveyStatus.PUBLISHED,
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    };

    const publicPollWhere = {
      organizationId: organization.id,
      status: { in: [PollStatus.LIVE, PollStatus.CLOSED] },
      allowAnonymous: true,
    };

    const [surveys, polls] = await this.prisma.$transaction([
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
    ]);

    const now = Date.now();

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        accountType: organization.accountType,
        description: organization.description,
        industry: organization.industry,
        size: organization.size,
        websiteUrl: organization.websiteUrl,
        contactEmail: organization.contactEmail,
        visibility: organization.visibility,
      },
      surveys: surveys.map((survey) => ({
        ...survey,
      })),
      polls: polls.map((poll) => ({
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        isActive:
          poll.status === PollStatus.LIVE &&
          !!poll.expiresAt &&
          poll.expiresAt.getTime() > now,
        expiresAt: poll.expiresAt,
        totalVotes: poll._count.votes,
      })),
    };
  }

  async editOrganization(
    orgId: string,
    input: UpdateOrganizationInput,
  ): Promise<OrganizationDomain> {
    const organization = await this.organizationRepository.findById(orgId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.organizationRepository.update(orgId, input);
  }

  async uploadOrganizationLogo(
    orgId: string,
    file: UploadedFileType,
  ): Promise<OrganizationDomain> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Logo file is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Logo must be an image');
    }

    const organization = await this.organizationRepository.findById(orgId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.logoUrl) {
      const publicId = this.extractCloudinaryPublicId(organization.logoUrl);
      if (publicId) {
        try {
          await this.cloudinaryService.deleteFile(publicId, 'image');
        } catch {
          // Best-effort cleanup; do not block logo updates if delete fails.
        }
      }
    }

    const uploaded = await this.cloudinaryService.uploadFile(file, {
      folder: 'organizations',
      resourceType: 'image',
    });

    return this.organizationRepository.update(orgId, {
      logoUrl: uploaded.url,
    });
  }

  async softDeleteOrganization(orgId: string): Promise<OrganizationDomain> {
    const organization = await this.organizationRepository.findById(orgId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.organizationRepository.update(orgId, {
      status: OrganizationStatus.ARCHIVED,
      deletedAt: new Date(),
    });
  }

  async transferOwnership(
    orgId: string,
    currentOwnerId: string,
    newOwnerUserId: string,
  ): Promise<void> {
    if (currentOwnerId === newOwnerUserId) {
      throw new BadRequestException('New owner cannot be current owner');
    }

    const currentOwnerMembership = await this.memberRepository.findMembership(
      orgId,
      currentOwnerId,
    );
    if (!currentOwnerMembership) {
      throw new NotFoundException('Current owner membership not found');
    }

    const membership = await this.memberRepository.findMembership(
      orgId,
      newOwnerUserId,
    );

    if (!membership || membership.status !== OrganizationMemberStatus.ACTIVE) {
      throw new BadRequestException('New owner must be an active member');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.organizationMember.update({
        where: { id: membership.id },
        data: { role: OrganizationRole.OWNER },
      });

      await tx.organizationMember.update({
        where: { id: currentOwnerMembership.id },
        data: { role: OrganizationRole.ADMIN },
      });

      await tx.organization.update({
        where: { id: orgId },
        data: { ownerId: newOwnerUserId },
      });
    });
  }

  /*
  =====================================================
  MEMBERSHIP & INVITES
  =====================================================
  */

  async getMembershipForUser(
    orgId: string,
    userId: string,
  ): Promise<OrganizationMemberDomain | null> {
    return this.memberRepository.findMembership(orgId, userId);
  }

  async listMembers(
    orgId: string,
    options?: { page?: number; limit?: number },
  ): Promise<OrganizationMemberDomain[]> {
    return this.memberRepository.listMembers(orgId, options);
  }

  async searchUsers(query: string, currentUserId?: string) {
    const results = await this.memberRepository.searchUsers(query);
    if (!currentUserId) return results;
    return results.filter((user) => user.id !== currentUserId);
  }

  private assertCanAssignRole(
    actorRole: OrganizationRoleDomain,
    targetRole: OrganizationRoleDomain,
  ) {
    if (targetRole === OrganizationRoleDomain.OWNER) {
      throw new BadRequestException('Cannot assign OWNER via this operation');
    }

    if (actorRole === OrganizationRoleDomain.OWNER) {
      // OWNER can assign ADMIN and MEMBER
      return;
    }

    if (
      actorRole === OrganizationRoleDomain.ADMIN &&
      targetRole === OrganizationRoleDomain.MEMBER
    ) {
      return;
    }

    throw new ForbiddenException('Not allowed to assign this role');
  }

  async inviteMember(
    orgId: string,
    actorMembership: OrganizationMemberDomain,
    email: string,
    role: OrganizationRoleDomain,
  ): Promise<void> {
    this.assertCanAssignRole(actorMembership.role, role);

    const organization = await this.organizationRepository.findById(orgId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existingUser = await this.memberRepository.findUserByEmail(email);
    if (!existingUser) {
      return; // avoid email enumeration
    }

    if (existingUser.id === actorMembership.userId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    const existingMembership = await this.memberRepository.findMembership(
      orgId,
      existingUser.id,
    );
    if (existingMembership) {
      if (existingMembership.status !== OrganizationMemberStatus.LEFT) {
        throw new BadRequestException(
          'User is already a member or has a pending invite',
        );
      }
    }

    const rawToken = randomBytes(64).toString('hex');
    const hashedToken = this.hashToken(rawToken);

    const payload: InvitePayload = {
      orgId,
      email: existingUser.email,
      role,
    };

    const key = this.getInviteKey(hashedToken);

    await this.redis.set(key, JSON.stringify(payload), {
      ex: this.inviteTtlSeconds,
    });

    if (existingMembership) {
      await this.memberRepository.updateMembership(existingMembership.id, {
        status: OrganizationMemberStatus.INVITED,
        role,
        invitedBy: actorMembership.userId,
        joinedAt: null,
      });
    } else {
      await this.memberRepository.createMember(
        orgId,
        existingUser.id,
        role,
        actorMembership.userId,
        OrganizationMemberStatus.INVITED,
      );
    }

    const frontendBaseUrl = (process.env.FRONTEND_URL ?? '').replace(/\/$/, '');
    if (!frontendBaseUrl) {
      throw new BadRequestException('FRONTEND_URL is not configured');
    }
    const inviteUrl = `${frontendBaseUrl}/app?inviteToken=${encodeURIComponent(
      rawToken,
    )}`;
    const inviteTtlDays = Math.round(this.inviteTtlSeconds / (60 * 60 * 24));
    const expiresAt = new Date(Date.now() + this.inviteTtlSeconds * 1000);
    const expiresAtUtc = expiresAt.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
    const expiryDetails = `This invitation expires in ${inviteTtlDays} days (on ${expiresAtUtc}).`;

    await this.emailSender.sendMail({
      to: existingUser.email,
      subject: `You're invited to join ${organization.name} on Survix`,
      text:
        `You have been invited to join ${organization.name} on Survix.\n\n` +
        `Accept the invite: ${inviteUrl}\n\n` +
        `${expiryDetails}\n\n` +
        `If you did not expect this invitation, you can ignore this email.`,
      html: buildSurvixEmailHtml({
        heading: `You're invited to join ${organization.name}`,
        body:
          `You have been invited to join ${organization.name} on Survix.` +
          ` Click below to accept your invite and sign in. ${expiryDetails}`,
        actionLabel: 'Accept Invitation',
        actionUrl: inviteUrl,
      }),
    });
  }

  async acceptInvite(
    userId: string,
    userEmail: string,
    rawToken: string,
  ): Promise<{ organizationId: string; role: OrganizationRoleDomain }> {
    const hashedToken = this.hashToken(rawToken);
    const key = this.getInviteKey(hashedToken);

    const payload = await this.redis.getdel<InvitePayload>(key);

    if (!payload) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    const organization = await this.organizationRepository.findById(
      payload.orgId,
    );
    if (
      !organization ||
      organization.status !== OrganizationStatus.ACTIVE ||
      organization.deletedAt
    ) {
      throw new BadRequestException('Organization inactive');
    }

    if (payload.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException('Invite token does not belong to this user');
    }

    const existingMembership = await this.memberRepository.findMembership(
      payload.orgId,
      userId,
    );

    if (existingMembership) {
      if (existingMembership.status !== OrganizationMemberStatus.INVITED) {
        throw new BadRequestException('User is already a member');
      }

      await this.memberRepository.updateMembership(existingMembership.id, {
        status: OrganizationMemberStatus.ACTIVE,
        joinedAt: new Date(),
        role: payload.role,
      });
    } else {
      await this.memberRepository.createMember(
        payload.orgId,
        userId,
        payload.role,
      );
    }

    return {
      organizationId: payload.orgId,
      role: payload.role,
    };
  }

  async removeMember(
    orgId: string,
    actorMembership: OrganizationMemberDomain,
    targetUserId: string,
  ): Promise<void> {
    if (actorMembership.userId === targetUserId) {
      throw new BadRequestException('Use leave organization instead');
    }

    const targetMembership = await this.memberRepository.findMembership(
      orgId,
      targetUserId,
    );

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    if (
      actorMembership.role === OrganizationRoleDomain.ADMIN &&
      (targetMembership.role === OrganizationRoleDomain.OWNER ||
        targetMembership.role === OrganizationRoleDomain.ADMIN)
    ) {
      throw new ForbiddenException('Admin cannot remove this member');
    }

    await this.memberRepository.updateMembership(targetMembership.id, {
      status: OrganizationMemberStatus.LEFT,
      leftAt: new Date(),
      removedBy: actorMembership.userId,
    });
  }

  async leaveOrganization(
    orgId: string,
    membership: OrganizationMemberDomain,
  ): Promise<void> {
    if (membership.status === OrganizationMemberStatus.SUSPENDED) {
      throw new ForbiddenException(
        'Suspended members cannot leave organization',
      );
    }

    if (membership.role === OrganizationRoleDomain.OWNER) {
      const activeOwnerCount =
        await this.memberRepository.countActiveOwners(orgId);

      if (activeOwnerCount <= 1) {
        throw new BadRequestException(
          'Transfer ownership before leaving organization',
        );
      }
    }

    await this.memberRepository.updateMembership(membership.id, {
      status: OrganizationMemberStatus.LEFT,
      leftAt: new Date(),
    });
  }

  async changeMemberRole(
    orgId: string,
    actorMembership: OrganizationMemberDomain,
    targetUserId: string,
    newRole: OrganizationRoleDomain,
  ): Promise<void> {
    const targetMembership = await this.memberRepository.findMembership(
      orgId,
      targetUserId,
    );

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    if (targetMembership.role === OrganizationRoleDomain.OWNER) {
      throw new ForbiddenException('Cannot change role of owner');
    }

    this.assertCanAssignRole(actorMembership.role, newRole);

    await this.memberRepository.updateMembership(targetMembership.id, {
      role: newRole,
    });
  }

  async suspendMember(
    orgId: string,
    actorMembership: OrganizationMemberDomain,
    targetUserId: string,
  ): Promise<void> {
    const targetMembership = await this.memberRepository.findMembership(
      orgId,
      targetUserId,
    );

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    if (targetMembership.role === OrganizationRoleDomain.OWNER) {
      throw new ForbiddenException('Cannot suspend owner');
    }

    if (
      actorMembership.role === OrganizationRoleDomain.ADMIN &&
      targetMembership.role === OrganizationRoleDomain.ADMIN
    ) {
      throw new ForbiddenException('Admin cannot suspend another admin');
    }

    await this.memberRepository.updateMembership(targetMembership.id, {
      status: OrganizationMemberStatus.SUSPENDED,
    });
  }

  async reactivateMember(
    orgId: string,
    actorMembership: OrganizationMemberDomain,
    targetUserId: string,
  ): Promise<void> {
    const targetMembership = await this.memberRepository.findMembership(
      orgId,
      targetUserId,
    );

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    if (targetMembership.role === OrganizationRoleDomain.OWNER) {
      // owner reactivation is effectively a no-op, but we keep consistency
      return;
    }

    if (
      actorMembership.role === OrganizationRoleDomain.ADMIN &&
      targetMembership.role === OrganizationRoleDomain.ADMIN
    ) {
      throw new ForbiddenException('Admin cannot reactivate another admin');
    }

    await this.memberRepository.updateMembership(targetMembership.id, {
      status: OrganizationMemberStatus.ACTIVE,
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getInviteKey(hashedToken: string): string {
    return `org:invite:${hashedToken}`;
  }

  private extractCloudinaryPublicId(url: string): string | null {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match?.[1] ?? null;
  }
}
