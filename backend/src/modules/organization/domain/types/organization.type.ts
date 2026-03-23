import {
  OrganizationVisibility,
  OrganizationStatus,
  OrganizationAccountType,
} from '@prisma/client';

export type OrganizationDomain = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  ownerId: string;
  accountType: OrganizationAccountType;
  isPersonal: boolean;
  description?: string | null;
  industry?: string | null;
  size?: string | null;
  websiteUrl?: string | null;
  contactEmail?: string | null;
  visibility: OrganizationVisibility;
  status: OrganizationStatus;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
