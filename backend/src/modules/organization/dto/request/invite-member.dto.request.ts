import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrganizationRoleDomain } from '../../domain/enums/organization-role.enum';

export class InviteMemberDtoRequest {
  @ApiProperty({
    example: 'user@gmail.com',
  })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    enum: OrganizationRoleDomain,
    example: OrganizationRoleDomain.MEMBER,
  })
  @IsEnum(OrganizationRoleDomain)
  role: OrganizationRoleDomain;
}
