import { ApiProperty } from '@nestjs/swagger';
import { OrganizationAccountType, OrganizationStatus } from '@prisma/client';
import { OrganizationRoleDomain } from '../../domain/enums/organization-role.enum';

export class OrganizationSummaryDtoResponse {
  @ApiProperty({
    example: '60f7f0b3b4d1c2a5f8e9a123',
  })
  id: string;

  @ApiProperty({
    example: 'Acme Inc',
  })
  name: string;

  @ApiProperty({
    example: 'acme-inc',
  })
  slug: string;

  @ApiProperty({
    example: 'https://cdn.app.com/org-logo.png',
    required: false,
    nullable: true,
  })
  logoUrl?: string | null;

  @ApiProperty({
    enum: OrganizationRoleDomain,
  })
  role: OrganizationRoleDomain;

  @ApiProperty({
    enum: OrganizationStatus,
  })
  status: OrganizationStatus;

  @ApiProperty({
    enum: OrganizationAccountType,
  })
  accountType: OrganizationAccountType;

  @ApiProperty()
  isPersonal: boolean;
}
