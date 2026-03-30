import {
  OrganizationAccountType,
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
  accountType?: OrganizationAccountType;
  isPersonal?: boolean;
  visibility: OrganizationVisibility;
  description?: string;
  industry?: string;
  size?: string;
  websiteUrl?: string;
  contactEmail?: string;
};

export type UpdateOrganizationInput = Partial<
  Omit<CreateOrganizationInput, 'ownerId' | 'slug'> & {
    logoUrl?: string | null;
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
  update(
    id: string,
    input: UpdateOrganizationInput,
  ): Promise<OrganizationDomain>;
}

export interface IOrganizationMemberRepository {
  findMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMemberDomain | null>;

  listMembers(
    organizationId: string,
    options?: { page?: number; limit?: number },
  ): Promise<OrganizationMemberDomain[]>;

  countActiveOwners(organizationId: string): Promise<number>;

  findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    username?: string | null;
    name?: string | null;
    avatar?: string | null;
  } | null>;

  searchUsers(query: string): Promise<
    Array<{
      id: string;
      email: string;
      username?: string | null;
      name?: string | null;
      avatar?: string | null;
    }>
  >;

  createOwnerMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMemberDomain>;

  createMember(
    organizationId: string,
    userId: string,
    role: OrganizationRoleDomain,
    invitedBy?: string,
    status?: OrganizationMemberStatus,
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
