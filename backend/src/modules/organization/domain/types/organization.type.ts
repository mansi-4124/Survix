import { OrganizationVisibility, OrganizationStatus } from '@prisma/client';

export type OrganizationDomain = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  ownerId: string;
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

