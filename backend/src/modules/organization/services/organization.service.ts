import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationMemberStatus, OrganizationStatus } from '@prisma/client';
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

    const rawToken = randomBytes(64).toString('hex');
    const hashedToken = this.hashToken(rawToken);

    const payload: InvitePayload = {
      orgId,
      email,
      role,
    };

    const key = this.getInviteKey(hashedToken);

    await this.redis.set(key, JSON.stringify(payload), {
      ex: this.inviteTtlSeconds,
    });

    await this.emailSender.sendMail({
      to: email,
      subject: 'Organization invite',
      text: `You have been invited to join an organization. Use this token to accept the invite: ${rawToken}`,
      html: `<p>You have been invited to join an organization.</p><p>Use this token to accept the invite:</p><p><strong>${rawToken}</strong></p>`,
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
      throw new BadRequestException('User is already a member');
    }

    await this.memberRepository.createMember(
      payload.orgId,
      userId,
      payload.role,
    );

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
