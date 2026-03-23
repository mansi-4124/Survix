import { ApiProperty } from '@nestjs/swagger';
import { OrganizationMemberStatus } from '@prisma/client';
import { OrganizationRoleDomain } from '../../domain/enums/organization-role.enum';

class OrganizationMemberUserDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  username?: string | null;

  @ApiProperty({ required: false })
  name?: string | null;

  @ApiProperty({ required: false })
  avatar?: string | null;
}

export class OrganizationMemberDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty({ enum: OrganizationRoleDomain })
  role: OrganizationRoleDomain;

  @ApiProperty({ enum: OrganizationMemberStatus })
  status: OrganizationMemberStatus;

  @ApiProperty({ required: false })
  joinedAt?: Date | null;

  @ApiProperty({ required: false })
  leftAt?: Date | null;

  @ApiProperty({ required: false, type: OrganizationMemberUserDtoResponse })
  user?: OrganizationMemberUserDtoResponse;
}
