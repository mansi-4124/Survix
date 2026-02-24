import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OrganizationMemberStatus, OrganizationRole } from '@prisma/client';
import {
  CreateOrganizationInput,
  IOrganizationMemberRepository,
  IOrganizationRepository,
  UpdateOrganizationInput,
} from '../domain/interfaces/organization-repository.interface';
import { OrganizationDomain } from '../domain/types/organization.type';
import { OrganizationMemberDomain } from '../domain/types/organization-member.type';
import { OrganizationRoleDomain } from '../domain/enums/organization-role.enum';

@Injectable()
export class PrismaOrganizationRepository
  implements IOrganizationRepository, IOrganizationMemberRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateOrganizationInput): Promise<OrganizationDomain> {
    const organization = await this.prisma.organization.create({
      data: {
        name: input.name,
        slug: input.slug,
        ownerId: input.ownerId,
        visibility: input.visibility,
        description: input.description,
        industry: input.industry,
        size: input.size,
        websiteUrl: input.websiteUrl,
        contactEmail: input.contactEmail,
        status: 'ACTIVE',
      },
    });

    return this.toOrganizationDomain(organization);
  }

  async findById(id: string): Promise<OrganizationDomain | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!organization) return null;
    return this.toOrganizationDomain(organization);
  }

  async findBySlug(slug: string): Promise<OrganizationDomain | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (!organization) return null;
    return this.toOrganizationDomain(organization);
  }

  async findByUser(userId: string): Promise<
    Array<{
      organization: OrganizationDomain;
      membership: OrganizationMemberDomain;
    }>
  > {
    const memberships = await this.prisma.organizationMember.findMany({
      where: {
        userId,
        status: {
          in: [
            OrganizationMemberStatus.ACTIVE,
            OrganizationMemberStatus.SUSPENDED,
          ],
        },
      },
      include: {
        organization: true,
      },
    });

    return memberships.map((m) => ({
      organization: this.toOrganizationDomain(m.organization),
      membership: this.toMemberDomain(m),
    }));
  }

  async update(
    id: string,
    input: UpdateOrganizationInput,
  ): Promise<OrganizationDomain> {
    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        industry: input.industry,
        size: input.size,
        websiteUrl: input.websiteUrl,
        contactEmail: input.contactEmail,
        visibility: input.visibility,
        status: input.status,
        deletedAt: input.deletedAt,
      },
    });

    return this.toOrganizationDomain(organization);
  }

  async findMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMemberDomain | null> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
    if (!member) return null;
    return this.toMemberDomain(member);
  }

  async listMembers(
    organizationId: string,
  ): Promise<OrganizationMemberDomain[]> {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId },
    });
    return members.map((m) => this.toMemberDomain(m));
  }

  async createOwnerMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMemberDomain> {
    const member = await this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role: OrganizationRole.OWNER,
        status: OrganizationMemberStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });
    return this.toMemberDomain(member);
  }

  async createMember(
    organizationId: string,
    userId: string,
    role: OrganizationRoleDomain,
    invitedBy?: string,
  ): Promise<OrganizationMemberDomain> {
    const member = await this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role: this.toPrismaRole(role),
        status: OrganizationMemberStatus.ACTIVE,
        joinedAt: new Date(),
        invitedBy,
      },
    });
    return this.toMemberDomain(member);
  }

  async updateMembership(
    id: string,
    input: Partial<{
      role: OrganizationRoleDomain;
      status: OrganizationMemberStatus;
      joinedAt: Date | null;
      leftAt: Date | null;
      invitedBy: string | null;
      removedBy: string | null;
    }>,
  ): Promise<OrganizationMemberDomain> {
    const member = await this.prisma.organizationMember.update({
      where: { id },
      data: {
        role: input.role ? this.toPrismaRole(input.role) : undefined,
        status: input.status,
        joinedAt: input.joinedAt,
        leftAt: input.leftAt,
        invitedBy: input.invitedBy,
        removedBy: input.removedBy,
      },
    });
    return this.toMemberDomain(member);
  }

  private toOrganizationDomain(prismaOrg: any): OrganizationDomain {
    return {
      id: prismaOrg.id,
      name: prismaOrg.name,
      slug: prismaOrg.slug,
      logoUrl: prismaOrg.logoUrl,
      ownerId: prismaOrg.ownerId,
      description: prismaOrg.description,
      industry: prismaOrg.industry,
      size: prismaOrg.size,
      websiteUrl: prismaOrg.websiteUrl,
      contactEmail: prismaOrg.contactEmail,
      visibility: prismaOrg.visibility,
      status: prismaOrg.status,
      deletedAt: prismaOrg.deletedAt,
      createdAt: prismaOrg.createdAt,
      updatedAt: prismaOrg.updatedAt,
    };
  }

  private toMemberDomain(prismaMember: any): OrganizationMemberDomain {
    return {
      id: prismaMember.id,
      organizationId: prismaMember.organizationId,
      userId: prismaMember.userId,
      role: this.toDomainRole(prismaMember.role),
      status: prismaMember.status,
      joinedAt: prismaMember.joinedAt,
      leftAt: prismaMember.leftAt,
      invitedBy: prismaMember.invitedBy,
      removedBy: prismaMember.removedBy,
    };
  }

  private toDomainRole(role: OrganizationRole): OrganizationRoleDomain {
    switch (role) {
      case OrganizationRole.OWNER:
        return OrganizationRoleDomain.OWNER;
      case OrganizationRole.ADMIN:
        return OrganizationRoleDomain.ADMIN;
      case OrganizationRole.MEMBER:
        return OrganizationRoleDomain.MEMBER;
      default: {
        const _exhaustive: never = role;
        throw new Error(`Unhandled organization role: ${_exhaustive}`);
      }
    }
  }

  private toPrismaRole(role: OrganizationRoleDomain): OrganizationRole {
    switch (role) {
      case OrganizationRoleDomain.OWNER:
        return OrganizationRole.OWNER;
      case OrganizationRoleDomain.ADMIN:
        return OrganizationRole.ADMIN;
      case OrganizationRoleDomain.MEMBER:
        return OrganizationRole.MEMBER;
      default: {
        const _exhaustive: never = role;
        throw new Error(`Unhandled organization role domain: ${_exhaustive}`);
      }
    }
  }
}
