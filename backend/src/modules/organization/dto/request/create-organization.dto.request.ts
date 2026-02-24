import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OrganizationVisibility } from '@prisma/client';

export class CreateOrganizationDtoRequest {
  @ApiProperty({
    example: 'Acme Inc',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'acme-inc',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim().toLowerCase())
  slug: string;

  @ApiProperty({
    enum: OrganizationVisibility,
    example: OrganizationVisibility.PRIVATE,
  })
  @IsEnum(OrganizationVisibility)
  visibility: OrganizationVisibility;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  contactEmail?: string;
}

