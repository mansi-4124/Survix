import {
  OrganizationStatus,
  OrganizationVisibility,
  OrganizationMemberStatus,
} from '@prisma/client';
import { OrganizationDomain } from '../types/organization.type';
import { OrganizationMemberDomain } from '../types/organization-member.type';
import { OrganizationRoleDomain } from '../enums/organization-role.enum';

export type CreateOrganizationInput = {
  name: string;
  slug: string;
  ownerId: string;
  visibility: OrganizationVisibility;
  description?: string;
  industry?: string;
  size?: string;
  websiteUrl?: string;
  contactEmail?: string;
};

export type UpdateOrganizationInput = Partial<
  Omit<
    CreateOrganizationInput,
    'ownerId' | 'slug'
  > & {
    status?: OrganizationStatus;
    deletedAt?: Date | null;
  }
>;

export interface IOrganizationRepository {
  create(input: CreateOrganizationInput): Promise<OrganizationDomain>;
  findById(id: string): Promise<OrganizationDomain | null>;
  findBySlug(slug: string): Promise<OrganizationDomain | null>;
  findByUser(userId: string): Promise<
    Array<{
      organization: OrganizationDomain;
      membership: OrganizationMemberDomain;
    }>
  >;
  update(id: string, input: UpdateOrganizationInput): Promise<OrganizationDomain>;
}

export interface IOrganizationMemberRepository {
  findMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMemberDomain | null>;

  listMembers(organizationId: string): Promise<OrganizationMemberDomain[]>;

  createOwnerMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMemberDomain>;

  createMember(
    organizationId: string,
    userId: string,
    role: OrganizationRoleDomain,
    invitedBy?: string,
  ): Promise<OrganizationMemberDomain>;

  updateMembership(
    id: string,
    input: Partial<{
      role: OrganizationRoleDomain;
      status: OrganizationMemberStatus;
      joinedAt: Date | null;
      leftAt: Date | null;
      invitedBy: string | null;
      removedBy: string | null;
    }>,
  ): Promise<OrganizationMemberDomain>;
}

