import { OrganizationMemberStatus } from '@prisma/client';
import { OrganizationRoleDomain } from '../enums/organization-role.enum';

export type OrganizationMemberDomain = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRoleDomain;
  status: OrganizationMemberStatus;
  joinedAt?: Date | null;
  leftAt?: Date | null;
  invitedBy?: string | null;
  removedBy?: string | null;
};

