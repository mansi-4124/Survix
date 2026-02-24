import { ApiProperty } from '@nestjs/swagger';
import {
  OrganizationStatus,
  OrganizationVisibility,
  OrganizationMemberStatus,
} from '@prisma/client';
import { OrganizationRoleDomain } from '../../domain/enums/organization-role.enum';

export class OrganizationDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  logoUrl?: string | null;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty({ required: false })
  industry?: string | null;

  @ApiProperty({ required: false })
  size?: string | null;

  @ApiProperty({ required: false })
  websiteUrl?: string | null;

  @ApiProperty({ required: false })
  contactEmail?: string | null;

  @ApiProperty({ enum: OrganizationVisibility })
  visibility: OrganizationVisibility;

  @ApiProperty({ enum: OrganizationStatus })
  status: OrganizationStatus;
}

export class OrganizationDetailsDtoResponse {
  @ApiProperty({ type: OrganizationDtoResponse })
  organization: OrganizationDtoResponse;

  @ApiProperty({ enum: OrganizationRoleDomain })
  currentUserRole: OrganizationRoleDomain;

  @ApiProperty({ enum: OrganizationMemberStatus })
  memberStatus: OrganizationMemberStatus;
}
