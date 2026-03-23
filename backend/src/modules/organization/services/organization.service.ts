import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationAccountType,
  OrganizationMemberStatus,
  OrganizationStatus,
  OrganizationVisibility,
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
  ) {}

  /*
  =====================================================
  ORGANIZATION CORE
  =====================================================
  */

  async createOrganization(userId: string, dto: CreateOrganizationDtoRequest) {
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

    const organization = await this.organizationRepository.create(input);

    const membership = await this.memberRepository.createOwnerMembership(
      organization.id,
      userId,
    );

    return { organization, membership };
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

    await this.memberRepository.updateMembership(membership.id, {
      role: OrganizationRoleDomain.OWNER,
    });

    await this.memberRepository.updateMembership(currentOwnerMembership.id, {
      role: OrganizationRoleDomain.ADMIN,
    });

    await this.organizationRepository.update(orgId, {
      ownerId: newOwnerUserId,
    } as UpdateOrganizationInput);
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

  async listMembers(orgId: string): Promise<OrganizationMemberDomain[]> {
    return this.memberRepository.listMembers(orgId);
  }

  async searchUsers(query: string) {
    return this.memberRepository.searchUsers(query);
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
      throw new BadRequestException(
        'User does not exist, ask them to signup to send invite',
      );
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

    const payload = await this.redis.get<InvitePayload>(key);

    if (!payload) {
      throw new BadRequestException('Invalid or expired invite token');
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

    await this.redis.del(key);

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
    const targetMembership = await this.memberRepository.findMembership(
      orgId,
      targetUserId,
    );

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    if (
      actorMembership.role === OrganizationRoleDomain.ADMIN &&
      targetMembership.role === OrganizationRoleDomain.OWNER
    ) {
      throw new ForbiddenException('Admin cannot remove owner');
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
}
