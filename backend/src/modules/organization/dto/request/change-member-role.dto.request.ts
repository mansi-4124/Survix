import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrganizationRoleDomain } from '../../domain/enums/organization-role.enum';

export class ChangeMemberRoleDtoRequest {
  @ApiProperty({
    enum: OrganizationRoleDomain,
    example: OrganizationRoleDomain.ADMIN,
  })
  @IsEnum(OrganizationRoleDomain)
  role: OrganizationRoleDomain;
}
