import { OrganizationMemberStatus } from '@prisma/client';
import { OrganizationRoleDomain } from '../enums/organization-role.enum';

export type OrganizationMemberDomain = {
  id: string;
  organizationId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    username?: string | null;
    name?: string | null;
    avatar?: string | null;
  };
  role: OrganizationRoleDomain;
  status: OrganizationMemberStatus;
  joinedAt?: Date | null;
  leftAt?: Date | null;
  invitedBy?: string | null;
  removedBy?: string | null;
};
